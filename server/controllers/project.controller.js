import { createProject, getAllProjectByUserId, addUsersToProject ,getProjectById} from "../services/project.services.js";
import Project from "../models/project.models.js";
import { validationResult } from 'express-validator';
import User from "../models/user.models.js";
import { removeUsersFromProject } from "../services/project.services.js";
export const createProjects = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;
        const loggedInUser = await User.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(400).json({ errors: 'User not Found' });
        }
        const userId = loggedInUser._id;
        const newProject = await createProject({ name, userId });
        res.status(201).json(newProject);
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
};

export const getAllProject = async (req, res) => {
    try {
        const loggedInUser = await User.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(400).json({ error: 'User not found' });
        }
        const allUserProjects = await getAllProjectByUserId({ userId: loggedInUser._id });
        return res.status(200).json({ projects: allUserProjects });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        const loggedInUser = await User.findOne({ email: req.user.email });
        const project = await addUsersToProject({ projectId, users, userId: loggedInUser._id });
        return res.status(200).json({ project });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};
export const getProjectbyId=async(req,res)=>{
    const { projectId } = req.params;

    try {

        const project = await getProjectById({ projectId });

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}


export const removeUserFromProjects = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        const loggedInUser = await User.findOne({ email: req.user.email });
        const project = await removeUsersFromProject({ projectId, users, userId: loggedInUser._id });
        return res.status(200).json({ project });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};