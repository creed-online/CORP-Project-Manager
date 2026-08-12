import {User} from "../models/user-models.js";
import {User} from "../models/project.models.js";
import {ProjectMember, User} from "../models/projectmember.models.js";
import asyncHandler from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token) {
        throw new ApiError(401, "Unauthorized. No token provided.");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?.userId).select("-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry");
        
        if(!user) {
            throw new ApiError(401, "Unauthorized. Invalid Access Token.");
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Unauthorized. Invalid Access Token.");
    }
});

export const validateProjectPermission = asyncHandler = (roles = []) => {
    asyncHandler(async (req, res, next) => {
        const {projectId} = req.params;

        if(!projectId) {
            throw new ApiError(400, "Project ID is required");
        }

        await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id)
        })  

        id(!project) {
            throw new ApiError(404, "Project not found");
        }

        const givenRole = project?.role;

        req.user.role = givenRole;

        if(!roles.includes(givenRole)) {
            throw new ApiError(403, "Forbidden. You do not have permission to access this resource.");
        }

        next();

    })
}