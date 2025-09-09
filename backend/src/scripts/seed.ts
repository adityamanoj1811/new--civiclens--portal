import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@civiclens.com' },
    update: {},
    create: {
      email: 'admin@civiclens.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create department head
  const deptPassword = await bcrypt.hash('dept123', 12);
  const deptHead = await prisma.user.upsert({
    where: { email: 'dept@civiclens.com' },
    update: {},
    create: {
      email: 'dept@civiclens.com',
      password: deptPassword,
      name: 'Rajesh Kumar',
      role: 'DEPARTMENT_HEAD',
      department: 'Public Works',
    },
  });

  // Create team member
  const memberPassword = await bcrypt.hash('member123', 12);
  const teamMember = await prisma.user.upsert({
    where: { email: 'member@civiclens.com' },
    update: {},
    create: {
      email: 'member@civiclens.com',
      password: memberPassword,
      name: 'Priya Sharma',
      role: 'TEAM_MEMBER',
      department: 'Public Works',
    },
  });

  // Create additional team members
  const additionalMembers = [
    {
      email: 'mike.wilson@civiclens.com',
      name: 'Mike Wilson',
      department: 'Public Works',
    },
    {
      email: 'sarah.thompson@civiclens.com',
      name: 'Sarah Thompson',
      department: 'Public Works',
    },
    {
      email: 'lisa.chen@civiclens.com',
      name: 'Lisa Chen',
      department: 'Sanitation Dept',
    },
    {
      email: 'robert.martinez@civiclens.com',
      name: 'Robert Martinez',
      department: 'Sanitation Dept',
    },
    {
      email: 'tom.rodriguez@civiclens.com',
      name: 'Tom Rodriguez',
      department: 'Water Department',
    },
    {
      email: 'maria.garcia@civiclens.com',
      name: 'Maria Garcia',
      department: 'Water Department',
    },
  ];

  for (const member of additionalMembers) {
    const password = await bcrypt.hash('password123', 12);
    await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        email: member.email,
        password,
        name: member.name,
        role: 'TEAM_MEMBER',
        department: member.department,
      },
    });
  }

  // Create sample issues
  const sampleIssues = [
    {
      title: 'Broken streetlight on Main Street',
      description: 'The streetlight at the intersection of Main St and 1st Ave has been out for 3 days',
      department: 'Public Works',
      latitude: 23.6139,
      longitude: 85.279,
      address: 'Main St & 1st Ave, Ranchi',
      priority: 'HIGH' as const,
      status: 'PENDING' as const,
      reportedById: admin.id,
    },
    {
      title: 'Large pothole on Oak Avenue',
      description: 'Deep pothole causing vehicle damage near Oak Ave and 3rd Street',
      department: 'Public Works',
      latitude: 23.3441,
      longitude: 85.3096,
      address: 'Oak Ave & 3rd Street, Ranchi',
      priority: 'CRITICAL' as const,
      status: 'IN_PROGRESS' as const,
      reportedById: admin.id,
      assignedToId: teamMember.id,
    },
    {
      title: 'Missed garbage collection on Elm Street',
      description: 'Garbage was not collected on scheduled pickup day',
      department: 'Sanitation Dept',
      latitude: 23.5041,
      longitude: 85.4298,
      address: 'Elm Street, Ranchi',
      priority: 'MEDIUM' as const,
      status: 'RESOLVED' as const,
      reportedById: deptHead.id,
    },
    {
      title: 'Water main leak on Pine Street',
      description: 'Water is flooding the street from a broken main',
      department: 'Water Department',
      latitude: 23.3739,
      longitude: 85.3262,
      address: 'Pine Street, Ranchi',
      priority: 'CRITICAL' as const,
      status: 'IN_PROGRESS' as const,
      reportedById: admin.id,
    },
    {
      title: 'Overflowing trash bin in Central Park',
      description: 'Trash bin near the playground is overflowing and attracting pests',
      department: 'Sanitation Dept',
      latitude: 23.4241,
      longitude: 85.3811,
      address: 'Central Park, Ranchi',
      priority: 'MEDIUM' as const,
      status: 'PENDING' as const,
      reportedById: teamMember.id,
    },
  ];

  for (const issueData of sampleIssues) {
    const issue = await prisma.issue.create({
      data: {
        ...issueData,
        lifecycle: {
          create: [
            {
              step: 'REPORTED',
              status: 'COMPLETED',
            },
            {
              step: 'ACKNOWLEDGED',
              status: issueData.status === 'PENDING' ? 'CURRENT' : 'COMPLETED',
            },
            ...(issueData.assignedToId ? [{
              step: 'ASSIGNED' as const,
              status: 'COMPLETED' as const,
            }] : []),
            ...(issueData.status === 'IN_PROGRESS' ? [{
              step: 'RESOLVED' as const,
              status: 'CURRENT' as const,
            }] : []),
            ...(issueData.status === 'RESOLVED' ? [{
              step: 'RESOLVED' as const,
              status: 'COMPLETED' as const,
            }, {
              step: 'CITIZEN_VERIFIED' as const,
              status: 'COMPLETED' as const,
            }] : []),
          ],
        },
      },
    });

    // Add some comments
    if (Math.random() > 0.5) {
      await prisma.comment.create({
        data: {
          content: 'Issue has been reviewed and prioritized.',
          issueId: issue.id,
          userId: admin.id,
        },
      });
    }
  }

  // Create sample meetings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  const sampleMeetings = [
    {
      title: 'Weekly Team Standup',
      description: 'Review progress and discuss upcoming tasks',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 30 * 60 * 1000), // 30 minutes
      type: 'TEAM' as const,
      organizerId: admin.id,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      title: 'Department Review',
      description: 'Monthly department performance review',
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 60 * 60 * 1000), // 1 hour
      type: 'DEPARTMENT' as const,
      organizerId: deptHead.id,
      location: 'Conference Room A',
    },
  ];

  for (const meetingData of sampleMeetings) {
    const meeting = await prisma.meeting.create({
      data: {
        ...meetingData,
        attendees: {
          create: [
            {
              userId: teamMember.id,
              status: 'INVITED',
            },
            {
              userId: deptHead.id,
              status: 'ACCEPTED',
            },
          ],
        },
      },
    });
  }

  // Create sample notifications
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await prisma.notification.createMany({
      data: [
        {
          title: 'Welcome to CivicLens',
          message: 'Welcome to the CivicLens admin portal. You can now manage civic issues efficiently.',
          type: 'INFO',
          userId: user.id,
        },
        {
          title: 'New Issue Assigned',
          message: 'A new high-priority issue has been assigned to your department.',
          type: 'WARNING',
          userId: user.id,
          isRead: Math.random() > 0.5,
        },
      ],
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Login credentials:');
  console.log('Admin: admin@civiclens.com / admin123');
  console.log('Department Head: dept@civiclens.com / dept123');
  console.log('Team Member: member@civiclens.com / member123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });