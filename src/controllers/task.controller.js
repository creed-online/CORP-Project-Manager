import mongoose from "mongoose";
import {User} from "../models/user-models.js";
import {Project} from "../models/project.models.js";
import {Task} from "../models/task.models.js";
import {SunTask} from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import { UseRolesEnum, AvailableRoles } from "../utils/constants.js";


const getTasks = asyncHandler(async (req, res) => {
    //test
})

const createTask = asyncHandler(async (req, res) => {
   const { title, description, assignedTo, status } = req.body;
   const {projectId} = req.params;
   const project = await Project.findById(projectId);

   if(!project) {
       throw new ApiError(404, "Project not found");
   }

   const files = req.files || []

   const attachments = files.map((file) => {
       return {
        url: `${process.env.SERVER_URL}/images/${file.originalname}`,
        mimetype: file.mimetype,
        size: file.size
       }
   })

   const task = await Task.create({
       title,
       description,
       project: new mongoose.Types.ObjectId(projectId),
       assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
       status,
       assignedBy: new mongoose.Types.ObjectId(req.user._id),
       attachments
   });

   return res
    .status(201)
    .json(new ApiResponse(201, "Task created successfully", task))
})

const getTaskById = asyncHandler(async (req, res) => {
    //test
})

const updateTask = asyncHandler(async (req, res) => {
    //test
})

const deleteTask = asyncHandler(async (req, res) => {
    //test
})

const createSubtask = asyncHandler(async (req, res) => {
    //test
})

const updateSubtask = asyncHandler(async (req, res) => {
    //test
})

const deleteSubtask = asyncHandler(async (req, res) => {
    //test
})


export {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask
}



