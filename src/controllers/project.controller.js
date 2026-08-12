import mongoose from "mongoose";
import {User} from "../models/user-models.js";
import {Project} from "../models/project.models.js";
import {ProjectMember} from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import {sendEmail, emamilVerificationMailgenContent, forgotPasswordMailgenContent} from "../utils/mail.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";


const getProjects = asyncHandler(async(req, res) => {
//test
});

const getProjectById = asyncHandler(async(req, res) => {
//test
});

const createProject = asyncHandler(async(req, res) => {
   const { name, description } = req.body

   const project = await Project.create({ 
    name, 
    description,
     createdBy: new mongoose.Types.ObjectId(req.user.id) });

    await ProjectMember.create({
        project: new mongoose.Types.ObjectId(project._id),
        user: new mongoose.Types.ObjectId(req.user._id),
        role: UserRolesEnum.ADMIN
    })

    return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

const updateProject = asyncHandler(async(req, res) => {
    const { name, description } = req.body;
    const {projectId} = req.params;

    const project = await Project.findByIdAndUpdate(projectId, { name, description }, { new: true })

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async(req, res) => {
    const {projectId} = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully"));
});

const addMemberToProject = asyncHandler(async(req, res) => {
//test
});

const getProjectMembers = asyncHandler(async(req, res) => {
//test
});

const updateMemberRole = asyncHandler(async(req, res) => {
//test
});

const deleteMember = asyncHandler(async(req, res) => {
//test
});

export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
};
