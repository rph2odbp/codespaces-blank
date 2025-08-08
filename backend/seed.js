const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Session = require('./models/Session');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Session.deleteMany();
    console.log('Cleared existing data.');

    // Create Users
    const users = await User.create([
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@campabbey.com',
        password: 'password123',
        role: 'admin',
      },
      {
        firstName: 'Staff',
        lastName: 'User',
        email: 'staff@campabbey.com',
        password: 'password123',
        // FIX: Ensure this user is a superadmin
        role: 'superadmin',
      },
      {
        firstName: 'Parent',
        lastName: 'One',
        email: 'parent1@example.com',
        password: 'password123',
        role: 'parent',
      },
    ]);
    console.log('Users created.');

    // Create Sessions
    await Session.create([
      {
        name: 'Week 1: Adventure Quest',
        startDate: new Date('2025-07-07'),
        endDate: new Date('2025-07-11'),
        capacity: 50,
        cost: 450,
      },
      {
        name: 'Week 2: Wilderness Explorers',
        startDate: new Date('2025-07-14'),
        endDate: new Date('2025-07-18'),
        capacity: 40,
        cost: 475,
      },
    ]);
    console.log('Sessions created.');

    console.log('Data seeding complete!');
  } catch (error) {
    console.error('Error during data seeding:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedData();