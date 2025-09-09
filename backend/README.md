# CivicLens Backend API

A comprehensive Node.js backend for the CivicLens civic issue reporting and management system.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Issue Management**: Complete CRUD operations for civic issues
- **User Management**: Admin and department head user management
- **Meeting Scheduling**: Create and manage team meetings
- **Real-time Updates**: Socket.IO for live notifications
- **File Uploads**: Support for issue attachments and user avatars
- **Analytics**: Comprehensive reporting and analytics
- **Audit Logging**: Complete audit trail for all operations
- **Caching**: Redis-based caching for performance
- **Rate Limiting**: Protection against abuse
- **Comprehensive Logging**: Winston-based logging system

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.IO
- **Caching**: Redis
- **File Upload**: Multer
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+

### Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run migrations
   npm run migrate
   
   # Seed the database
   npm run seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Issue Management

- `GET /api/issues` - Get all issues (with filtering)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue (Admin only)
- `POST /api/issues/:id/comments` - Add comment to issue

### User Management

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (Admin only)
- `GET /api/users/:id/stats` - Get user statistics

### Analytics

- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/departments` - Department analytics
- `GET /api/analytics/priorities` - Priority distribution
- `GET /api/analytics/status` - Status distribution
- `GET /api/analytics/timeline` - Time-based analytics
- `GET /api/analytics/team` - Team performance

### Meetings

- `GET /api/meetings` - Get all meetings
- `GET /api/meetings/:id` - Get single meeting
- `POST /api/meetings` - Create meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `PUT /api/meetings/:id/attendees/:userId` - Update attendance
- `GET /api/meetings/upcoming` - Get upcoming meetings

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications` - Create notification (Admin)
- `GET /api/notifications/stats` - Notification statistics

### File Upload

- `POST /api/upload/issue/:issueId` - Upload issue attachments
- `POST /api/upload/avatar` - Upload user avatar
- `GET /api/upload/file/:id` - Download file
- `DELETE /api/upload/file/:id` - Delete file

## Database Schema

The system uses PostgreSQL with the following main entities:

- **Users**: System users with roles (Admin, Department Head, Team Member)
- **Issues**: Civic issues with location, priority, and lifecycle tracking
- **Comments**: Comments on issues
- **Attachments**: File attachments for issues
- **Meetings**: Scheduled meetings with attendees
- **Notifications**: User notifications
- **Audit Logs**: System audit trail

## Role-Based Access Control

### Admin
- Full system access
- User management
- All issues across departments
- System analytics

### Department Head
- Department-specific issues
- Team member management within department
- Department analytics
- Meeting scheduling

### Team Member
- Assigned issues only
- Own profile management
- Meeting participation

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet Security**: Security headers
- **File Upload Security**: Type and size validation

## Performance Features

- **Redis Caching**: Cached analytics and frequently accessed data
- **Database Indexing**: Optimized database queries
- **Pagination**: Efficient data loading
- **Connection Pooling**: Optimized database connections
- **Compression**: Response compression

## Monitoring & Logging

- **Winston Logging**: Comprehensive logging system
- **Error Handling**: Centralized error handling
- **Audit Trail**: Complete operation logging
- **Health Checks**: System health monitoring

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client
- `npm run seed` - Seed database with sample data

### Testing

```bash
npm test
```

### Database Operations

```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Generate new migration
npx prisma migrate dev --name migration_name
```

## Deployment

1. **Environment Setup**:
   - Set production environment variables
   - Configure PostgreSQL and Redis
   - Set up SSL certificates

2. **Build and Deploy**:
   ```bash
   npm run build
   npm start
   ```

3. **Database Setup**:
   ```bash
   npm run migrate
   npm run seed
   ```

## Default Login Credentials

After seeding the database:

- **Admin**: admin@civiclens.com / admin123
- **Department Head**: dept@civiclens.com / dept123  
- **Team Member**: member@civiclens.com / member123

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.