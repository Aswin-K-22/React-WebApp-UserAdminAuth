import User from '../../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await User.findOne({ email, isAdmin: true });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(admin._id);

        res.cookie('tokenAdmin', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Enable in production for HTTPS
            sameSite: 'strict', // CSRF protection
            maxAge: 3600000, // 1 hour
        });

        res.status(200).json({ message: 'Login successful', token, name: admin.name });
    } catch (error) {
        console.error('Error logging in admin:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Logout Admin
const logoutAdmin = (req, res) => {
    try {
        res.clearCookie('tokenAdmin', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during admin logout:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const fetchAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select('-password'); // Exclude password

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// Edit User
const editUser = async (req, res) => {
    const { name, email, password, userId } = req.body;
    console.log('Received Object Id of edit user :-',userId)
console.log('received data:-',name, email, password)

    try {
        if (!name || !email || !password || !userId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ _id: userId, isAdmin: false });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const emailInUse = await User.findOne({ email, _id: { $ne: userId } });
        if (emailInUse) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.name = name;
        user.email = email;
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: 'User data updated successfully!' });
    } catch (error) {
        console.error('Error updating user data:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// Fetch Admin Data
const fetchAdminData = async (req, res) => {
    try {
        const admin = await User.findOne({ _id: req.admin.id, isAdmin: true });
        if (!admin) {
            return res.status(401).json({
                isAuthenticated: false,
                message: 'Admin not found',
            });
        }

        res.status(200).json({
            message: 'Admin already logged in',
            isAuthenticated: true,
            token: req.cookies.tokenAdmin,
            name: admin.name,
            profilePhoto: admin.profilePhoto === 'Profile Pic' ? null : admin.profilePhoto,
        });
    } catch (error) {
        console.error('Error fetching admin data:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Add User
const addUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message:'All fields (Name, Email, and Password) are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: 'User added successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Error adding user:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const deleteUser = async (req, res) => {
    const { id } = req.params; 
    console.log('Received Object Id :-',id)
  
    try {
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }
  
      await User.deleteOne({ _id: id });
  
      res.status(200).json({
        message: 'User deleted successfully',
        ok : true
      });
    } catch (error) {
      console.error('Error deleting user:', error.message);
      res.status(500).json({
        message: 'Server error. Unable to delete the user.',
        error: error.message,
      });
    }
  };

export {
    editUser,
    fetchAdminData,
    loginAdmin,
    logoutAdmin,
    fetchAllUsers,
    addUser,
    deleteUser
}