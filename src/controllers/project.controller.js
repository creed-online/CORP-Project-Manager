import mongoose from "mongoose";
import {User} from "../models/user-models.js";
import {Project} from "../models/project.models.js";
import {ProjectMember} from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import { UseRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "projectDetails"
            }
        },
        { $unwind: "$projectDetails" },
        {
            $lookup: {
                from: "projectmembers",
                localField: "projectDetails._id",
                foreignField: "project",
                as: "projectMembers"
            }
        },
        {
            $addFields: {
                memberCount: { $size: "$projectMembers" }
            }
        },
        {
            $project: {
                _id: "$projectDetails._id",
                name: "$projectDetails.name",
                description: "$projectDetails.description",
                memberCount: 1,
                createdAt: "$projectDetails.createdAt",
                createdBy: "$projectDetails.createdBy",
                role: "$role"
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async(req, res) => {
    const {projectId} = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
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
        role: UseRolesEnum.ADMIN
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
    const {email, role} = req.body;
    const {projectId} = req.params;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }   
    
    await ProjectMember.findByIdAndUpdate({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(user._id),
    },
    {
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(user._id),
        role: role
    },
    { upsert: true, new: true }

);

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Member added to project successfully"));
});

const getProjectMembers = asyncHandler(async(req, res) => {
    const {projectId} = req.params;
    const project = await Project.findById(req.params);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId)
            },

        },
        
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            email: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        {$addFields: {user: {$arrayElemAt: ["$user", 0]}}},
        {
            $project: {
                user: 1,
                role: 1,
                createdAt: 1,
                updatedAt: 1,
                _id: 0
            }
        }
        
    ]);

    return res
    .status(200)
    .json(new ApiResponse(200, projectMembers, "Project members fetched successfully"));
});

const updateMemberRole = asyncHandler(async(req, res) => {
    const {projectId, userId} = req.params;
    const {newRole} = req.body;

    if(!AvailabelUserRole.includes(newRole)) {
        throw new ApiError(400, "Invalid role");
    }

    let projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId)
    });

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    projectMember = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
         { role: newRole },
          { new: true }
        );

        if (!projectMember) {
            throw new ApiError(404, "Project member not found");
        }

        return res
        .status(200)
        .json(new ApiResponse(200, projectMember, "Project member role updated successfully"));
});

const deleteMember = asyncHandler(async(req, res) => {
    const {projectId, userId} = req.params;

    const projectMember = await ProjectMember.findOneAndDelete({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId)
    });

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, projectMember, "Project member deleted successfully"));  
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
