import { Schema } from "mongoose";
import mongoose from "mongoose";

const subtaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
   createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    }
}, {timestamps: true});

export const subtask = mongoose.model("Subtask", subtaskSchema); 
