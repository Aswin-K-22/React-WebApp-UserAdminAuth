import User from '../../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { profile } from 'console';


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
      

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword });
        const token = generateToken(newUser._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Enable in production
            sameSite: 'strict', // Prevent CSRF
            maxAge: 3600000, // 1 hour
        });


        
        res.status(201).json({ message: 'User created successfully', userId: newUser._id ,token ,name : newUser.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Enable in production
            sameSite: 'strict', // Prevent CSRF
            maxAge: 3600000, // 1 hour
        });


        res.status(200).json({ message: 'Login successful', token , name : user.name ,
            profilePhoto : user.profilePhoto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logout successful' });
};



const fetchUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ isAuthenticated: false, message: 'User not found-fetchUserData-Method' });
        }
        res.status(200).json({
            message: 'User already logged in',
            isAuthenticated: true,
            token: req.cookies.token,
            name: user.name,
            profilePhoto : user.profilePhoto === 'Profile Pic' ? null : user.profilePhoto,
        });
    } catch (error) {
        res.status(500).json({ isAuthenticated: false, message: 'Internal server error-etchUserData-Method catchblock' });
    }
};






const uploadProfilePic = async (req, res) => {
    try {
      const { userId = req.user.id, imageUrl } = req.body;
  
      // Validate required fields
      if (!userId || !imageUrl) {
        return res.status(400).json({ error: 'User ID and Image URL are required!' });
      }
  
      // Find user in the database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }
  
      // Update user's profile photo
      user.profilePhoto = imageUrl;
      await user.save();
  
      return res.status(200).json({
        message: 'Profile picture updated successfully!',
        profilePhoto: user.profilePhoto,
      });
    } catch (error) {
      console.error('Error handling profile picture:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  




const deleteProfilePic = async (req, res) => {
    try {
      const userId = req.user.id; 
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }
  
      if (user.profilePhoto && user.profilePhoto !== 'Profile Pic') {
        const imagePath = path.join(uploadDir, path.basename(user.profilePhoto));
  
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
  
        user.profilePhoto = 'Profile Pic';
        await user.save();
  
        return res.status(200).json({ message: 'Profile picture deleted successfully!' });
      }
  
      return res.status(400).json({ message: 'No profile picture to delete!' });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  

export { registerUser, loginUser  ,fetchUserData,logoutUser,uploadProfilePic ,deleteProfilePic };
