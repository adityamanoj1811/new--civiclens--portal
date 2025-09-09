import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { validate } from '@/middleware/validation';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['ADMIN', 'DEPARTMENT_HEAD', 'TEAM_MEMBER']).optional(),
    department: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (but typically restricted to admins in production)
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name, role = 'TEAM_MEMBER', department } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User already exists with this email'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      department,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      createdAt: true,
    }
  });

  // Generate token
  const token = generateToken(user.id);

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    data: {
      user,
      token
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and get password
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token
    }
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { name, department, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name && { name }),
      ...(department && { department }),
      ...(avatar && { avatar }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatar: true,
      updatedAt: true,
    }
  });

  logger.info(`User profile updated: ${req.user!.email}`);

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedNewPassword }
  });

  logger.info(`Password changed for user: ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  logger.info(`User logged out: ${req.user!.email}`);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

export default router;