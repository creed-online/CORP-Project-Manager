import { Schema } from "mongoose";
import mongoose from "mongoose";

const projectNoteSchema = new Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    }
}, {timestamps: true});

export const projectNote = mongoose.model("ProjectNote", projectNoteSchema); 
