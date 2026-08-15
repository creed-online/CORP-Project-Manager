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
    //test
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



