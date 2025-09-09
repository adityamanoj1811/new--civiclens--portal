import express from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { validate } from '@/middleware/validation';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { cache } from '@/utils/redis';

const router = express.Router();

// Validation schemas
const createIssueSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    department: z.string().min(1, 'Department is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  }),
});

const updateIssueSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    assignedToId: z.string().optional(),
  }),
});

const querySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    department: z.string().optional(),
    assignedToId: z.string().optional(),
    search: z.string().optional(),
  }),
});

// Helper function to calculate SLA status
const calculateSLA = (createdAt: Date, status: string, priority: string) => {
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
  
  // SLA hours based on priority
  const slaHours = {
    CRITICAL: 4,
    HIGH: 24,
    MEDIUM: 72,
    LOW: 168
  };

  const maxHours = slaHours[priority as keyof typeof slaHours] || 72;
  
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return 'Closed';
  }
  
  if (diffHours > maxHours) {
    return 'Overdue';
  }
  
  const remainingHours = maxHours - diffHours;
  if (remainingHours <= 2) {
    return `${remainingHours}h left`;
  }
  
  return `${Math.floor(remainingHours / 24)}d left`;
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private
router.get('/', authenticate, validate(querySchema), asyncHandler(async (req: AuthRequest, res) => {
  const {
    page = '1',
    limit = '10',
    status,
    priority,
    department,
    assignedToId,
    search
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  // Role-based filtering
  if (req.user!.role === 'TEAM_MEMBER') {
    where.assignedToId = req.user!.id;
  } else if (req.user!.role === 'DEPARTMENT_HEAD' && req.user!.department) {
    where.department = req.user!.department;
  }

  // Additional filters
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (department) where.department = department;
  if (assignedToId) where.assignedToId = assignedToId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Check cache first
  const cacheKey = `issues:${JSON.stringify({ where, skip, limitNum })}`;
  const cachedResult = await cache.get(cacheKey);
  
  if (cachedResult) {
    return res.json({
      success: true,
      data: cachedResult.issues,
      pagination: cachedResult.pagination
    });
  }

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        reportedBy: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        comments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        lifecycle: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { comments: true, attachments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.issue.count({ where })
  ]);

  // Add SLA calculation
  const issuesWithSLA = issues.map(issue => ({
    ...issue,
    sla: calculateSLA(issue.createdAt, issue.status, issue.priority)
  }));

  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum)
  };

  // Cache the result
  await cache.set(cacheKey, { issues: issuesWithSLA, pagination }, 300); // 5 minutes

  res.json({
    success: true,
    data: issuesWithSLA,
    pagination
  });
}));

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      reportedBy: {
        select: { id: true, name: true, email: true }
      },
      assignedTo: {
        select: { id: true, name: true, email: true }
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      attachments: true,
      lifecycle: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!issue) {
    return res.status(404).json({
      success: false,
      error: 'Issue not found'
    });
  }

  // Check permissions
  if (req.user!.role === 'TEAM_MEMBER' && issue.assignedToId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (req.user!.role === 'DEPARTMENT_HEAD' && issue.department !== req.user!.department) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const issueWithSLA = {
    ...issue,
    sla: calculateSLA(issue.createdAt, issue.status, issue.priority)
  };

  res.json({
    success: true,
    data: issueWithSLA
  });
}));

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
router.post('/', authenticate, validate(createIssueSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { title, description, department, latitude, longitude, address, priority = 'MEDIUM' } = req.body;

  const issue = await prisma.issue.create({
    data: {
      title,
      description,
      department,
      latitude,
      longitude,
      address,
      priority,
      reportedById: req.user!.id,
      lifecycle: {
        create: [
          {
            step: 'REPORTED',
            status: 'COMPLETED'
          },
          {
            step: 'ACKNOWLEDGED',
            status: 'CURRENT'
          }
        ]
      }
    },
    include: {
      reportedBy: {
        select: { id: true, name: true, email: true }
      },
      lifecycle: true
    }
  });

  // Clear cache
  await cache.del('issues:*');

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('issue-created', issue);

  logger.info(`New issue created: ${issue.id} by ${req.user!.email}`);

  res.status(201).json({
    success: true,
    data: issue
  });
}));

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
router.put('/:id', authenticate, validate(updateIssueSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Get current issue
  const currentIssue = await prisma.issue.findUnique({
    where: { id },
    include: { lifecycle: true }
  });

  if (!currentIssue) {
    return res.status(404).json({
      success: false,
      error: 'Issue not found'
    });
  }

  // Check permissions
  if (req.user!.role === 'TEAM_MEMBER' && currentIssue.assignedToId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (req.user!.role === 'DEPARTMENT_HEAD' && currentIssue.department !== req.user!.department) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Handle lifecycle updates
  const lifecycleUpdates: any[] = [];

  if (updates.assignedToId && updates.assignedToId !== currentIssue.assignedToId) {
    lifecycleUpdates.push({
      step: 'ASSIGNED',
      status: 'COMPLETED'
    });
  }

  if (updates.status === 'RESOLVED' && currentIssue.status !== 'RESOLVED') {
    lifecycleUpdates.push({
      step: 'RESOLVED',
      status: 'COMPLETED'
    });
  }

  const issue = await prisma.issue.update({
    where: { id },
    data: {
      ...updates,
      ...(lifecycleUpdates.length > 0 && {
        lifecycle: {
          createMany: {
            data: lifecycleUpdates
          }
        }
      })
    },
    include: {
      reportedBy: {
        select: { id: true, name: true, email: true }
      },
      assignedTo: {
        select: { id: true, name: true, email: true }
      },
      lifecycle: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  // Clear cache
  await cache.del('issues:*');

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('issue-updated', issue);

  logger.info(`Issue updated: ${issue.id} by ${req.user!.email}`);

  res.json({
    success: true,
    data: issue
  });
}));

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const issue = await prisma.issue.findUnique({
    where: { id }
  });

  if (!issue) {
    return res.status(404).json({
      success: false,
      error: 'Issue not found'
    });
  }

  await prisma.issue.delete({
    where: { id }
  });

  // Clear cache
  await cache.del('issues:*');

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('issue-deleted', { id });

  logger.info(`Issue deleted: ${id} by ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Issue deleted successfully'
  });
}));

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
router.post('/:id/comments', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Comment content is required'
    });
  }

  // Check if issue exists and user has access
  const issue = await prisma.issue.findUnique({
    where: { id }
  });

  if (!issue) {
    return res.status(404).json({
      success: false,
      error: 'Issue not found'
    });
  }

  // Check permissions
  if (req.user!.role === 'TEAM_MEMBER' && issue.assignedToId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (req.user!.role === 'DEPARTMENT_HEAD' && issue.department !== req.user!.department) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      issueId: id,
      userId: req.user!.id
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('comment-added', { issueId: id, comment });

  res.status(201).json({
    success: true,
    data: comment
  });
}));

export default router;