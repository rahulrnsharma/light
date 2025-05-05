const User = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utility/logger');

exports.register = async (req, res) => {
    const { name, username, password, role } = req.body;
  
    try {
      let user = await User.findOne({ username });
      if (user) return res.status(400).json({ message: 'User already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      user = new User({ name, username, password: hashedPassword, role });
      await user.save();
      logger.info("New User create successfully",user)
      const payload = { userId: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.status(201).json({ token });
    } catch (err) {
      logger.error("Error in user creation",{stack:err.stack,msg:err.message})
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  exports.login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      const payload = { userId: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      logger.info("User logged in successfully",user)
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  