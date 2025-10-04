import { PrismaClient } from '../../generated/prisma';
import { hashPassword } from './auth.utils';

const prisma = new PrismaClient();

async function seed() {
  try {
    
    await prisma.notification.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.message.deleteMany();
    await prisma.user.deleteMany();

    
    const adminPassword = await hashPassword('admin123');
    const teacherPassword = await hashPassword('teacher123');
    const studentPassword = await hashPassword('student123');

    
    const official = await prisma.user.create({
      data: {
        email: 'director@college.edu',
        password: adminPassword,
        name: 'Dr. Smith',
        role: 'OFFICIAL',
        position: 'Director',
      },
    });

    
    const teacher1 = await prisma.user.create({
      data: {
        email: 'prof.john@college.edu',
        password: teacherPassword,
        name: 'Prof. John',
        role: 'TEACHER',
        branch: 'CSE',
      },
    });

    const teacher2 = await prisma.user.create({
      data: {
        email: 'prof.jane@college.edu',
        password: teacherPassword,
        name: 'Prof. Jane',
        role: 'TEACHER',
        branch: 'IT',
      },
    });

    
    const student1 = await prisma.user.create({
      data: {
        email: 'student1@college.edu',
        password: studentPassword,
        name: 'Alice Johnson',
        role: 'STUDENT',
        branch: 'CSE',
      },
    });

    const student2 = await prisma.user.create({
      data: {
        email: 'student2@college.edu',
        password: studentPassword,
        name: 'Bob Smith',
        role: 'STUDENT',
        branch: 'CSE',
      },
    });

    const student3 = await prisma.user.create({
      data: {
        email: 'student3@college.edu',
        password: studentPassword,
        name: 'Carol Davis',
        role: 'STUDENT',
        branch: 'IT',
      },
    });

    console.log('Database seeded successfully!');
    console.log('Users created:');
    console.log('- Official:', official.email);
    console.log('- Teacher 1:', teacher1.email);
    console.log('- Teacher 2:', teacher2.email);
    console.log('- Student 1:', student1.email);
    console.log('- Student 2:', student2.email);
    console.log('- Student 3:', student3.email);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();