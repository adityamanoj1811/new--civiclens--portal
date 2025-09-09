import express from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { validate } from '@/middleware/validation';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = express.Router();

// Validation schemas
const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format'),
    type: z.enum(['TEAM', 'DEPARTMENT', 'PROJECT', 'REVIEW']).optional(),
    location: z.string().optional(),
    meetingLink: z.string().url().optional(),
    attendeeIds: z.array(z.string()).optional(),
  }),
});

const updateMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    type: z.enum(['TEAM', 'DEPARTMENT', 'PROJECT', 'REVIEW']).optional(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    location: z.string().optional(),
    meetingLink: z.string().url().optional(),
  }),
});

const querySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(['TEAM', 'DEPARTMENT', 'PROJECT', 'REVIEW']).optional(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    upcoming: z.string().optional(),
  }),
});

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private
router.get('/', authenticate, validate(querySchema), asyncHandler(async (req: AuthRequest, res) => {
  const {
    page = '1',
    limit = '10',
    type,
    status,
    upcoming
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {
    OR: [
      { organizerId: req.user!.id },
      { attendees: { some: { userId: req.user!.id } } }
    ]
  };

  if (type) where.type = type;
  if (status) where.status = status;
  if (upcoming === 'true') {
    where.startTime = { gte: new Date() };
  }

  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    }),
    prisma.meeting.count({ where })
  ]);

  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum)
  };

  res.json({
    success: true,
    data: meetings,
    pagination
  });
}));

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, name: true, email: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  if (!meeting) {
    return res.status(404).json({
      success: false,
      error: 'Meeting not found'
    });
  }

  // Check if user has access to this meeting
  const hasAccess = meeting.organizerId === req.user!.id || 
    meeting.attendees.some(attendee => attendee.userId === req.user!.id);

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: meeting
  });
}));

// @desc    Create new meeting
// @route   POST /api/meetings
// @access  Private
router.post('/', authenticate, validate(createMeetingSchema), asyncHandler(async (req: AuthRequest, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    type = 'TEAM',
    location,
    meetingLink,
    attendeeIds = []
  } = req.body;

  // Validate that end time is after start time
  if (new Date(endTime) <= new Date(startTime)) {
    return res.status(400).json({
      success: false,
      error: 'End time must be after start time'
    });
  }

  // Check if attendees exist
  if (attendeeIds.length > 0) {
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { in: attendeeIds },
        isActive: true
      },
      select: { id: true }
    });

    if (existingUsers.length !== attendeeIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more attendees not found'
      });
    }
  }

  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type,
      location,
      meetingLink,
      organizerId: req.user!.id,
      attendees: {
        create: attendeeIds.map((userId: string) => ({
          userId,
          status: 'INVITED'
        }))
      }
    },
    include: {
      organizer: {
        select: { id: true, name: true, email: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('meeting-created', meeting);

  logger.info(`Meeting created: ${meeting.id} by ${req.user!.email}`);

  res.status(201).json({
    success: true,
    data: meeting
  });
}));

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private
router.put('/:id', authenticate, validate(updateMeetingSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Get current meeting
  const currentMeeting = await prisma.meeting.findUnique({
    where: { id }
  });

  if (!currentMeeting) {
    return res.status(404).json({
      success: false,
      error: 'Meeting not found'
    });
  }

  // Check if user is the organizer
  if (currentMeeting.organizerId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Only the organizer can update this meeting'
    });
  }

  // Validate time if both are provided
  if (updates.startTime && updates.endTime) {
    if (new Date(updates.endTime) <= new Date(updates.startTime)) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }
  }

  const meeting = await prisma.meeting.update({
    where: { id },
    data: {
      ...updates,
      ...(updates.startTime && { startTime: new Date(updates.startTime) }),
      ...(updates.endTime && { endTime: new Date(updates.endTime) })
    },
    include: {
      organizer: {
        select: { id: true, name: true, email: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('meeting-updated', meeting);

  logger.info(`Meeting updated: ${meeting.id} by ${req.user!.email}`);

  res.json({
    success: true,
    data: meeting
  });
}));

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const meeting = await prisma.meeting.findUnique({
    where: { id }
  });

  if (!meeting) {
    return res.status(404).json({
      success: false,
      error: 'Meeting not found'
    });
  }

  // Check if user is the organizer
  if (meeting.organizerId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Only the organizer can delete this meeting'
    });
  }

  await prisma.meeting.delete({
    where: { id }
  });

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('meeting-deleted', { id });

  logger.info(`Meeting deleted: ${id} by ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Meeting deleted successfully'
  });
}));

// @desc    Update attendee status
// @route   PUT /api/meetings/:id/attendees/:userId
// @access  Private
router.put('/:id/attendees/:userId', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id, userId } = req.params;
  const { status } = req.body;

  if (!['ACCEPTED', 'DECLINED', 'TENTATIVE'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status'
    });
  }

  // Check if user can update this attendee status
  if (req.user!.id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own attendance status'
    });
  }

  const attendee = await prisma.meetingAttendee.findUnique({
    where: {
      meetingId_userId: {
        meetingId: id,
        userId: userId
      }
    }
  });

  if (!attendee) {
    return res.status(404).json({
      success: false,
      error: 'Attendee not found'
    });
  }

  const updatedAttendee = await prisma.meetingAttendee.update({
    where: {
      meetingId_userId: {
        meetingId: id,
        userId: userId
      }
    },
    data: { status },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  logger.info(`Meeting attendance updated: ${id} by ${req.user!.email} - ${status}`);

  res.json({
    success: true,
    data: updatedAttendee
  });
}));

// @desc    Get upcoming meetings for user
// @route   GET /api/meetings/upcoming
// @access  Private
router.get('/upcoming', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { limit = '5' } = req.query;
  const limitNum = parseInt(limit as string);

  const meetings = await prisma.meeting.findMany({
    where: {
      startTime: { gte: new Date() },
      status: 'SCHEDULED',
      OR: [
        { organizerId: req.user!.id },
        { attendees: { some: { userId: req.user!.id } } }
      ]
    },
    take: limitNum,
    include: {
      organizer: {
        select: { id: true, name: true, email: true }
      },
      attendees: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    },
    orderBy: { startTime: 'asc' }
  });

  res.json({
    success: true,
    data: meetings
  });
}));

export default router;