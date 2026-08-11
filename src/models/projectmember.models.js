import { Schema } from "mongoose";
import mongoose from "mongoose";

import {AvailableRoles, UseRolesEnum} from "../utils/constants.js";

const projectMemberSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    role: {
        type: String,
        enum: AvailableRoles,
        required: true,
        default: UseRolesEnum.MEMBER,
    }
}, {timestamps: true});

export const projectMember = mongoose.model("ProjectMember", projectMemberSchema); 