import { Schema } from "mongoose";
import mongoose from "mongoose";
import { AvailableTaskStatus, taskStatusEnum } from "../utils/constants.js";

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: AvailableTaskStatus,
        default: taskStatusEnum.TODO
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    attachments: {
        type: [{
            url: String,
            filename: String,
            mimetype: String,
            size: Number
        }],
        default: []
    }
}, { timestamps: true });

export const Task = mongoose.model("Task", taskSchema);
export default Task;
