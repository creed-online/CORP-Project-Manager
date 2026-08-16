import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { AvailableTaskStatus } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo", "avatar username fullName");

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status } = req.body;
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (status && !AvailableTaskStatus.includes(status)) {
        throw new ApiError(400, "Invalid task status");
    }

    if (assignedTo) {
        const projectMember = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(assignedTo)
        });

        if (!projectMember) {
            throw new ApiError(400, "Assigned user is not a member of this project");
        }
    }

    const files = req.files || [];

    const attachments = files.map((file) => ({
        url: `${process.env.SERVER_URL}/images/${file.originalname}`,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    }));

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
        .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0]
                }
            }
        }
    ]);

    if (!task || task.length === 0) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
    const { title, description, status, assignedTo } = req.body;
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const task = await Task.findOne({
        _id: taskId,
        project: new mongoose.Types.ObjectId(projectId)
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (status && !AvailableTaskStatus.includes(status)) {
        throw new ApiError(400, "Invalid task status");
    }

    if (assignedTo !== undefined) {
        if (assignedTo) {
            const projectMember = await ProjectMember.findOne({
                project: new mongoose.Types.ObjectId(projectId),
                user: new mongoose.Types.ObjectId(assignedTo)
            });

            if (!projectMember) {
                throw new ApiError(400, "Assigned user is not a member of this project");
            }
            task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
        } else {
            task.assignedTo = null;
        }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    const task = await Task.findOne({
        _id: taskId,
        project: new mongoose.Types.ObjectId(projectId)
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await Subtask.deleteMany({
        task: new mongoose.Types.ObjectId(taskId),
        project: new mongoose.Types.ObjectId(projectId)
    });

    await Task.findByIdAndDelete(taskId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Task deleted successfully"));
});

const createSubtask = asyncHandler(async (req, res) => {
    const { title, description, isCompleted } = req.body;
    const { projectId, taskId } = req.params;

    const task = await Task.findOne({
        _id: taskId,
        project: new mongoose.Types.ObjectId(projectId)
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const subtask = await Subtask.create({
        title,
        description,
        isCompleted: Boolean(isCompleted),
        task: new mongoose.Types.ObjectId(taskId),
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(projectId)
    });

    return res
        .status(201)
        .json(new ApiResponse(201, subtask, "Subtask created successfully"));
});

const updateSubtask = asyncHandler(async (req, res) => {
    const { title, description, isCompleted } = req.body;
    const { projectId, subTaskId } = req.params;

    const subtask = await Subtask.findOne({
        _id: subTaskId,
        project: new mongoose.Types.ObjectId(projectId)
    });

    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    if (title !== undefined) subtask.title = title;
    if (description !== undefined) subtask.description = description;
    if (isCompleted !== undefined) subtask.isCompleted = Boolean(isCompleted);

    await subtask.save();

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, "Subtask updated successfully"));
});

const deleteSubtask = asyncHandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;

    const subtask = await Subtask.findOneAndDelete({
        _id: subTaskId,
        project: new mongoose.Types.ObjectId(projectId)
    });

    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Subtask deleted successfully"));
});

export {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask
};


