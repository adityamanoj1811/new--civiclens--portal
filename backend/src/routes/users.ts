import express from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { validate } from '@/middleware/validation';
import { authenticate, authorize, authorizeOwnerOrAdmin, AuthRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = express.Router();

// Validation schemas
const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    department: z.string().optional(),
    role: z.enum(['ADMIN', 'DEPARTMENT_HEAD', 'TEAM_MEMBER']).optional(),
    isActive: z.boolean().optional(),
  }),
});

const querySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    role: z.enum(['ADMIN', 'DEPARTMENT_HEAD', 'TEAM_MEMBER']).optional(),
    department: z.string().optional(),
    isActive: z.string().optional(),
    search: z.string().optional(),
  }),
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin and Department Heads)
router.get('/', authenticate, authorize('ADMIN', 'DEPARTMENT_HEAD'), validate(querySchema), asyncHandler(async (req: AuthRequest, res) => {
  const {
    page = '1',
    limit = '10',
    role,
    department,
    isActive,
    search
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  // Role-based filtering
  if (req.user!.role === 'DEPARTMENT_HEAD' && req.user!.department) {
    where.department = req.user!.department;
  }

  // Additional filters
  if (role) where.role = role;
  if (department) where.department = department;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedIssues: true,
            reportedIssues: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum)
  };

  res.json({
    success: true,
    data: users,
    pagination
  });
}));

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  // Check if user can access this profile
  if (req.user!.role !== 'ADMIN' && req.user!.id !== id) {
    // Department heads can view users in their department
    if (req.user!.role === 'DEPARTMENT_HEAD') {
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { department: true }
      });
      
      if (!targetUser || targetUser.department !== req.user!.department) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      assignedIssues: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: {
          assignedIssues: true,
          reportedIssues: true,
          comments: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', authenticate, validate(updateUserSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check permissions
  if (req.user!.role !== 'ADMIN' && req.user!.id !== id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Only admins can change role and isActive status
  if (req.user!.role !== 'ADMIN') {
    delete updates.role;
    delete updates.isActive;
  }

  const user = await prisma.user.update({
    where: { id },
    data: updates,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatar: true,
      isActive: true,
      updatedAt: true
    }
  });

  logger.info(`User updated: ${user.email} by ${req.user!.email}`);

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user!.id === id) {
    return res.status(400).json({
      success: false,
      error: 'You cannot delete your own account'
    });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { email: true }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Soft delete by setting isActive to false
  await prisma.user.update({
    where: { id },
    data: { isActive: false }
  });

  logger.info(`User deactivated: ${user.email} by ${req.user!.email}`);

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
router.get('/:id/stats', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  // Check permissions
  if (req.user!.role !== 'ADMIN' && req.user!.id !== id) {
    if (req.user!.role === 'DEPARTMENT_HEAD') {
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { department: true }
      });
      
      if (!targetUser || targetUser.department !== req.user!.department) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
  }

  const [
    totalAssigned,
    pendingIssues,
    inProgressIssues,
    resolvedIssues,
    totalReported,
    totalComments
  ] = await Promise.all([
    prisma.issue.count({ where: { assignedToId: id } }),
    prisma.issue.count({ where: { assignedToId: id, status: 'PENDING' } }),
    prisma.issue.count({ where: { assignedToId: id, status: 'IN_PROGRESS' } }),
    prisma.issue.count({ where: { assignedToId: id, status: 'RESOLVED' } }),
    prisma.issue.count({ where: { reportedById: id } }),
    prisma.comment.count({ where: { userId: id } })
  ]);

  // Calculate resolution rate
  const resolutionRate = totalAssigned > 0 ? Math.round((resolvedIssues / totalAssigned) * 100) : 0;

  // Get recent activity
  const recentIssues = await prisma.issue.findMany({
    where: { assignedToId: id },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  const stats = {
    totalAssigned,
    pendingIssues,
    inProgressIssues,
    resolvedIssues,
    totalReported,
    totalComments,
    resolutionRate,
    recentIssues
  };

  res.json({
    success: true,
    data: stats
  });
}));

export default router;