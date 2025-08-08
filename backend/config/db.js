const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // The MONGO_URI is loaded from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the process with a failure code if we can't connect to the DB
    process.exit(1);
  }
};

module.exports = connectDB; 