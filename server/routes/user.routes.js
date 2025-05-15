import { createUserController,loginController,profilecontroller,logoutController } from "../controllers/user.controller.js";
import {Router} from "express";
import { body } from 'express-validator';
import { AuthUser } from "../middleware/auth.middleware.js";
import { getAllUsersController } from "../controllers/user.controller.js";
import User from "../models/user.models.js";
const router=Router();
router.post('/register',
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
    createUserController);

router.post('/login',
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
    loginController);
router.get('/profile', AuthUser, profilecontroller);
router.get('/logout',AuthUser,logoutController)
router.get('/all', AuthUser, getAllUsersController);
router.get('/getid', async (req, res) => {
    try {
      console.log('Full Request URL:', req.url); // Log the full URL
      console.log('Decoded Email:', req.query.email); // Check the email
  
      const email = req.query.email;
  
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      res.status(200).json({ userId: user._id });
    } catch (error) {
      console.error('Error fetching user ID:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  

export default router;
