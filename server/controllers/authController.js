const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authController = {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, name, website } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create new user
      const user = new User({
        email,
        password,
        name,
        website
      });

      await user.save();

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          website: user.website
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        console.log('Login attempt failed: User not found', email);
      return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Login attempt failed: Invalid password', email);
      return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          website: user.website
        }
      });
    } catch (error) {
      console.error('Server login error:', error);
      res.status(500).json({ 
        message: 'Error logging in', 
        error: error.message,
      });
    }
  },

  // Reset password
  async forgotPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.password = newPassword;
      await user.save();
      console.log('Password updated successfully');
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ 
        message: 'Error resetting password',
        error: error.message 
      });
    }
  }
};


module.exports = authController;