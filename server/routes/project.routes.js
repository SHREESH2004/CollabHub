import { createProjects } from "../controllers/project.controller.js";
import {Router} from "express";
import { body } from "express-validator";
import { AuthUser } from "../middleware/auth.middleware.js";
import { getAllProject ,addUserToProject,getProjectbyId} from "../controllers/project.controller.js";
import mongoose from "mongoose";
import Project from "../models/project.models.js";
import { removeUserFromProjects} from "../controllers/project.controller.js";
import { validationResult } from "express-validator";
const router=Router()
router.post('/create',AuthUser,
    body('name').isString().withMessage('Name is required'),
    createProjects
)
router.get('/all',
    AuthUser,
    getAllProject
)

router.put('/add-user',
    AuthUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    addUserToProject
)
router.get('/get-project-details/:projectId',
    AuthUser,
    getProjectbyId
)
router.put('/remove-user',
    AuthUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    removeUserFromProjects
)

export default router;