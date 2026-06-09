import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users
    await User.deleteMany();
    console.log('Cleared existing users.');

    // Seed default employee (Field Work)
    const agentUser = new User({
      name: 'Ankit Sharma',
      employeeId: 'FT-99021',
      email: 'agent@fieldtrack.com',
      password: 'password123',
      role: 'agent'
    });
    await agentUser.save();

    // Seed default admin (Management)
    const adminUser = new User({
      name: 'Admin Manager',
      employeeId: 'FT-ADMIN01',
      email: 'admin@fieldtrack.com',
      password: 'adminpassword123',
      role: 'admin'
    });
    await adminUser.save();

    console.log('Seeded accounts successfully:');
    console.log('1. Field Work Account:');
    console.log('   Email: agent@fieldtrack.com');
    console.log('   Password: password123');
    console.log('   Role: agent');
    console.log('2. Admin Account:');
    console.log('   Email: admin@fieldtrack.com');
    console.log('   Password: adminpassword123');
    console.log('   Role: admin');

    mongoose.connection.close();
    console.log('Seeding finished.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
