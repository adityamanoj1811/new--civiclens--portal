import express from 'express';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { cache } from '@/utils/redis';

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const cacheKey = `analytics:dashboard:${req.user!.role}:${req.user!.department || 'all'}`;
  const cachedData = await cache.get(cacheKey);
  
  if (cachedData) {
    return res.json({
      success: true,
      data: cachedData
    });
  }

  // Build where clause based on user role
  const whereClause: any = {};
  if (req.user!.role === 'DEPARTMENT_HEAD' && req.user!.department) {
    whereClause.department = req.user!.department;
  } else if (req.user!.role === 'TEAM_MEMBER') {
    whereClause.assignedToId = req.user!.id;
  }

  const [
    totalIssues,
    pendingIssues,
    inProgressIssues,
    resolvedIssues,
    criticalIssues,
    overdueIssues
  ] = await Promise.all([
    prisma.issue.count({ where: whereClause }),
    prisma.issue.count({ where: { ...whereClause, status: 'PENDING' } }),
    prisma.issue.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
    prisma.issue.count({ where: { ...whereClause, status: 'RESOLVED' } }),
    prisma.issue.count({ where: { ...whereClause, priority: 'CRITICAL' } }),
    prisma.issue.count({
      where: {
        ...whereClause,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
        }
      }
    })
  ]);

  // Calculate resolution rate
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  // Calculate SLA compliance (simplified)
  const slaCompliance = totalIssues > 0 ? Math.round(((totalIssues - overdueIssues) / totalIssues) * 100) : 100;

  const dashboardData = {
    totalIssues,
    pendingIssues,
    inProgressIssues,
    resolvedIssues,
    criticalIssues,
    overdueIssues,
    resolutionRate,
    slaCompliance
  };

  // Cache for 5 minutes
  await cache.set(cacheKey, dashboardData, 300);

  res.json({
    success: true,
    data: dashboardData
  });
}));

// @desc    Get department analytics
// @route   GET /api/analytics/departments
// @access  Private (Admin and Department Heads)
router.get('/departments', authenticate, authorize('ADMIN', 'DEPARTMENT_HEAD'), asyncHandler(async (req: AuthRequest, res) => {
  const cacheKey = `analytics:departments:${req.user!.role}:${req.user!.department || 'all'}`;
  const cachedData = await cache.get(cacheKey);
  
  if (cachedData) {
    return res.json({
      success: true,
      data: cachedData
    });
  }

  // Build where clause
  const whereClause: any = {};
  if (req.user!.role === 'DEPARTMENT_HEAD' && req.user!.department) {
    whereClause.department = req.user!.department;
  }

  const departmentStats = await prisma.issue.groupBy({
    by: ['department'],
    where: whereClause,
    _count: {
      id: true
    },
    _sum: {
      id: true
    }
  });

  const departmentAnalytics = await Promise.all(
    departmentStats.map(async (dept) => {
      const [resolved, pending, inProgress] = await Promise.all([
        prisma.issue.count({
          where: { department: dept.department, status: 'RESOLVED' }
        }),
        prisma.issue.count({
          where: { department: dept.department, status: 'PENDING' }
        }),
        prisma.issue.count({
          where: { department: dept.department, status: 'IN_PROGRESS' }
        })
      ]);

      const total = dept._count.id;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      return {
        department: dept.department,
        total,
        resolved,
        pending,
        inProgress,
        resolutionRate
      };
    })
  );

  // Cache for 10 minutes
  await cache.set(cacheKey, departmentAnalytics, 600);

  res.json({
    success: true,
    data: departmentAnalytics
  });
}));

// @desc    Get priority analytics
// @route   GET /api/analytics/priorities
// @access  Private
router.get('/priorities', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const cacheKey = `analytics:priorities:${req.user!.role}:${req.user!.department || 'all'}`;
  const cachedData = await cache.get(cacheKey);
  
  if (cachedData) {
    return res.json({
      success: true,
      data: cachedData
    });
  }

  // Build where clause
  const whereClause: any = {};
  if (req.user!.role === 'DEPARTMENT_HEAD' && req.user!.department) {
    whereClause.department = req.user!.department;
  } else if (req.user!.role === 'TEAM_MEMBER') {
    whereClause.assignedToId = req.user!.id;
  }

  const priorityStats = await prisma.issue.groupBy({
    by: ['priority'],
    where: whereClause,
    _count: {
      id: true
    }
  });

  const priorityAnalytics = priorityStats.map(stat => ({
    priority: stat.priority,
    count: stat._count.id
  }));

  // Cache for 10 minutes
  await cache.set(cacheKey, priorityAnalytics, 600);

  res.json({
    success: true,
    data: priorityAnalytics
  });
}));

// @desc    Get status analytics
// @route   GET /api/analytics/status
// @access  Private
router.get('/status', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const cacheKey = `analytics:status:${req.user!.role}:${req.user!.department || 'all'}`;
  const cachedData = await cache.get(cacheKey);
  
  if (cachedData) {
    return res.json({
      success: true,
      data: cachedData
    });
  }

  // Build where clause
  const whereClause: any = {};
  if (req.user!.role === 'DEPARTMENT_HEAD' && req.user!.department) {
    whereClause.department = req.user!.department;
  } else if (req.user!.role === 'TEAM_MEMBER') {
    whereClause.assignedToId = req.user!.id;
  }

  const statusStats = await prisma.issue.groupBy({
    by: ['status'],
    where: whereClause,
    _count: {
      id: true
    }
  });

  const statusAnalytics = statusStats.map(stat => ({
    status: stat.status,
    count: stat._count.id
  }));

  // Cache for 10 minutes
  await cache.set(cacheKey, statusAnalytics, 600);

  res.json({
    success: true,
    data: statusAnalytics
  });
}));

// @desc    Get time-based analytics
// @route   GET /api/analytics/timeline
// @access  Private
router.get('/timeline', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { period = '30d' } = req.query;
  
  const cacheKey = `analytics:timeline:${period}:${req.user!.role}:${req.user!.department || 'all'}`;
  const cachedData = await cache.get(cacheKey);
  
  if (cachedData) {
    return res.json({
      success: true,
      data: cachedData
    });
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Build where clause
  const whereClause: any = {
    createdAt: {
      gte: startDate,
      lte: now
    }
  };
  
  if (req.user!.role === 'DEPARTMENT_HEAD' && req.user!.department) {
    whereClause.department = req.user!.department;
  } else if (req.user!.role === 'TEAM_MEMBER') {
    whereClause.assignedToId = req.user!.id;
  }

  // Get daily issue counts
  const issues = await prisma.issue.findMany({
    where: whereClause,
    select: {
      createdAt: true,
      status: true,
      updatedAt: true
    }
  });

  // Group by date
  const timelineData: { [key: string]: { reported: number; resolved: number } } = {};
  
  issues.forEach(issue => {
    const reportedDate = issue.createdAt.toISOString().split('T')[0];
    
    if (!timelineData[reportedDate]) {
      timelineData[reportedDate] = { reported: 0, resolved: 0 };
    }
    
    timelineData[reportedDate].reported++;
    
    if (issue.status === 'RESOLVED') {
      const resolvedDate = issue.updatedAt.toISOString().split('T')[0];
      if (!timelineData[resolvedDate]) {
        timelineData[resolvedDate] = { reported: 0, resolved: 0 };
      }
      timelineData[resolvedDate].resolved++;
    }
  });

  // Convert to array and sort by date
  const timeline = Object.entries(timelineData)
    .map(([date, data]) => ({
      date,
      ...data
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Cache for 1 hour
  await cache.set(cacheKey, timeline, 3600);

  res.json({
    success: true,
    data: timeline
  });
}));

// @desc    Get team performance analytics
// @route   GET /api/analytics/team
// @access  Private (Admin and Department Heads)
router.get('/team', authenticate, authorize('ADMIN', 'DEPARTMENT_HEAD'), asyncHandler(async (req: AuthRequest, res) => {
  const cacheKey = `analytics:team:${req.user!.role}:${req.user!.department || 'all'}`;
  const cachedData = await cache.get(cacheKey);
  
  if (cachedData) {
    return res.json({
      success: true,
      data: cachedData
    });
  }

  // Build where clause for users
  const userWhereClause: any = {};
  if (req.user!.role === 'DEPARTMENT_HEAD' && req.user!.department) {
    userWhereClause.department = req.user!.department;
  }

  const teamMembers = await prisma.user.findMany({
    where: {
      ...userWhereClause,
      role: 'TEAM_MEMBER',
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      assignedIssues: {
        select: {
          id: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  const teamAnalytics = teamMembers.map(member => {
    const totalAssigned = member.assignedIssues.length;
    const resolved = member.assignedIssues.filter(issue => issue.status === 'RESOLVED').length;
    const pending = member.assignedIssues.filter(issue => issue.status === 'PENDING').length;
    const inProgress = member.assignedIssues.filter(issue => issue.status === 'IN_PROGRESS').length;
    
    const resolutionRate = totalAssigned > 0 ? Math.round((resolved / totalAssigned) * 100) : 0;
    
    // Calculate average resolution time (simplified)
    const resolvedIssues = member.assignedIssues.filter(issue => issue.status === 'RESOLVED');
    const avgResolutionTime = resolvedIssues.length > 0 
      ? Math.round(resolvedIssues.reduce((acc, issue) => {
          const diffMs = issue.updatedAt.getTime() - issue.createdAt.getTime();
          return acc + (diffMs / (1000 * 60 * 60 * 24)); // Convert to days
        }, 0) / resolvedIssues.length * 10) / 10
      : 0;

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      department: member.department,
      totalAssigned,
      resolved,
      pending,
      inProgress,
      resolutionRate,
      avgResolutionTime
    };
  });

  // Cache for 15 minutes
  await cache.set(cacheKey, teamAnalytics, 900);

  res.json({
    success: true,
    data: teamAnalytics
  });
}));

export default router;