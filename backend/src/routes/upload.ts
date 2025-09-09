import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = path.join(uploadDir, 'issues');
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images and documents
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter
});

// @desc    Upload file for issue
// @route   POST /api/upload/issue/:issueId
// @access  Private
router.post('/issue/:issueId', authenticate, upload.array('files', 5), asyncHandler(async (req: AuthRequest, res) => {
  const { issueId } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    });
  }

  // Check if issue exists and user has access
  const issue = await prisma.issue.findUnique({
    where: { id: issueId }
  });

  if (!issue) {
    // Clean up uploaded files
    files.forEach(file => {
      fs.unlinkSync(file.path);
    });
    
    return res.status(404).json({
      success: false,
      error: 'Issue not found'
    });
  }

  // Check permissions
  if (req.user!.role === 'TEAM_MEMBER' && issue.assignedToId !== req.user!.id) {
    // Clean up uploaded files
    files.forEach(file => {
      fs.unlinkSync(file.path);
    });
    
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (req.user!.role === 'DEPARTMENT_HEAD' && issue.department !== req.user!.department) {
    // Clean up uploaded files
    files.forEach(file => {
      fs.unlinkSync(file.path);
    });
    
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Save file information to database
  const attachments = await Promise.all(
    files.map(file => 
      prisma.attachment.create({
        data: {
          filename: file.originalname,
          filepath: file.path,
          mimetype: file.mimetype,
          size: file.size,
          issueId
        }
      })
    )
  );

  logger.info(`Files uploaded for issue ${issueId}: ${files.length} files by ${req.user!.email}`);

  res.status(201).json({
    success: true,
    data: attachments
  });
}));

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', authenticate, upload.single('avatar'), asyncHandler(async (req: AuthRequest, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  // Check if it's an image
  if (!file.mimetype.startsWith('image/')) {
    fs.unlinkSync(file.path);
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed for avatars'
    });
  }

  // Update user avatar path
  const avatarPath = `/uploads/issues/${file.filename}`;
  
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { avatar: avatarPath }
  });

  logger.info(`Avatar uploaded by ${req.user!.email}`);

  res.json({
    success: true,
    data: {
      filename: file.filename,
      path: avatarPath,
      size: file.size
    }
  });
}));

// @desc    Get file
// @route   GET /api/upload/file/:id
// @access  Private
router.get('/file/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: {
      issue: true
    }
  });

  if (!attachment) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Check permissions
  if (req.user!.role === 'TEAM_MEMBER' && attachment.issue.assignedToId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (req.user!.role === 'DEPARTMENT_HEAD' && attachment.issue.department !== req.user!.department) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Check if file exists
  if (!fs.existsSync(attachment.filepath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found on disk'
    });
  }

  // Set appropriate headers
  res.setHeader('Content-Type', attachment.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);

  // Stream the file
  const fileStream = fs.createReadStream(attachment.filepath);
  fileStream.pipe(res);
}));

// @desc    Delete file
// @route   DELETE /api/upload/file/:id
// @access  Private
router.delete('/file/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: {
      issue: true
    }
  });

  if (!attachment) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Check permissions
  if (req.user!.role === 'TEAM_MEMBER' && attachment.issue.assignedToId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (req.user!.role === 'DEPARTMENT_HEAD' && attachment.issue.department !== req.user!.department) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Delete file from disk
  if (fs.existsSync(attachment.filepath)) {
    fs.unlinkSync(attachment.filepath);
  }

  // Delete from database
  await prisma.attachment.delete({
    where: { id }
  });

  logger.info(`File deleted: ${attachment.filename} by ${req.user!.email}`);

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
}));

// Error handling middleware for multer
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files'
      });
    }
  }
  
  if (error.message === 'Only images and documents are allowed') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  next(error);
});

export default router;