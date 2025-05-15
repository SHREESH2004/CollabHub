import User from "../models/user.models.js";
import { createUser } from "../services/user.services.js";
import { validationResult } from 'express-validator';
import redisClient from "../services/redis.service.js";
import { getAllUsers } from "../services/user.services.js";
export const createUserController = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await createUser(req.body);

        const token = await user.generateJWT();

        delete user._doc.password;

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).send(error.message);
    }
}
export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        const token = await user.generateJWT();

        delete user._doc.password;

        res.status(200).json({ user, token });


    } catch (err) {

        console.log(err);

        res.status(400).send(err.message);
    }
}

export const profilecontroller = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        console.log('User Profile:', req.user); // Better log message

        res.status(200).json({ user: req.user });
    } catch (error) {
        console.error('Profile Controller Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const logoutController = async (req, res) => {
    try {

        const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];
        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        res.status(200).json({
            message: 'Logged out successfully'
        });
    }
    catch(error){

    }
}
export const getAllUsersController = async (req, res) => {
    try {

        const loggedInUser = await User.findOne({
            email: req.user.email
        })

        const allUsers = await getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })

    } catch (err) {

        console.log(err)

        res.status(400).json({ error: err.message })

    }
}