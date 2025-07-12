import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory (one level up)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createGuestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if guest user already exists
    const existingUser = await User.findOne({ username: 'guest_interviewer' });
    
    if (existingUser) {
      console.log('Guest user already exists');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('guest1234', salt);

    // Create the guest user
    const guestUser = new User({
      fullName: 'Guest Interviewer',
      username: 'guest_interviewer',
      email: 'guest@interview.com',
      password: hashedPassword,
      bio: 'Guest account for interviews',
      profileImg: '',
      coverImg: '',
      followers: [],
      following: [],
      likedPosts: []
    });

    await guestUser.save();
    console.log('Guest user created successfully');
    console.log('Username: guest_interviewer');
    console.log('Password: guest1234');

  } catch (error) {
    console.error('Error creating guest user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createGuestUser(); 