import express from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { validate } from '@/middleware/validation';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = express.Router();

// Validation schemas
const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).optional(),
    userIds: z.array(z.string()).optional(),
  }),
});

const querySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).optional(),
    isRead: z.string().optional(),
  }),
});

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', authenticate, validate(querySchema), asyncHandler(async (req: AuthRequest, res) => {
  const {
    page = '1',
    limit = '20',
    type,
    isRead
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {
    userId: req.user!.id
  };

  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false
      }
    })
  ]);

  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum)
  };

  res.json({
    success: true,
    data: notifications,
    pagination,
    unreadCount
  });
}));

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }

  // Check if user owns this notification
  if (notification.userId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  res.json({
    success: true,
    data: updatedNotification
  });
}));

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user!.id,
      isRead: false
    },
    data: { isRead: true }
  });

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }

  // Check if user owns this notification
  if (notification.userId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  await prisma.notification.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin only)
router.post('/', authenticate, authorize('ADMIN'), validate(createNotificationSchema), asyncHandler(async (req: AuthRequest, res) => {
  const {
    title,
    message,
    type = 'INFO',
    userIds
  } = req.body;

  let targetUserIds = userIds;

  // If no specific users provided, send to all active users
  if (!userIds || userIds.length === 0) {
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true }
    });
    targetUserIds = allUsers.map(user => user.id);
  }

  // Create notifications for all target users
  const notifications = await prisma.notification.createMany({
    data: targetUserIds.map((userId: string) => ({
      title,
      message,
      type,
      userId
    }))
  });

  // Emit real-time notifications
  const io = req.app.get('io');
  targetUserIds.forEach((userId: string) => {
    io.to(`user-${userId}`).emit('notification', {
      title,
      message,
      type,
      createdAt: new Date()
    });
  });

  logger.info(`Notifications created: ${notifications.count} by ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: `${notifications.count} notifications created successfully`
  });
}));

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const [
    totalNotifications,
    unreadNotifications,
    infoNotifications,
    warningNotifications,
    errorNotifications,
    successNotifications
  ] = await Promise.all([
    prisma.notification.count({
      where: { userId: req.user!.id }
    }),
    prisma.notification.count({
      where: { userId: req.user!.id, isRead: false }
    }),
    prisma.notification.count({
      where: { userId: req.user!.id, type: 'INFO' }
    }),
    prisma.notification.count({
      where: { userId: req.user!.id, type: 'WARNING' }
    }),
    prisma.notification.count({
      where: { userId: req.user!.id, type: 'ERROR' }
    }),
    prisma.notification.count({
      where: { userId: req.user!.id, type: 'SUCCESS' }
    })
  ]);

  const stats = {
    total: totalNotifications,
    unread: unreadNotifications,
    byType: {
      info: infoNotifications,
      warning: warningNotifications,
      error: errorNotifications,
      success: successNotifications
    }
  };

  res.json({
    success: true,
    data: stats
  });
}));

export default router;