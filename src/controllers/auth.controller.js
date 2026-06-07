import {User} from "../models/user-models.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import {sendEmail, emamilVerificationMailgenContent} from "../utils/mail.js";

const generatAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Error while generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {username, email, password, FullName, role} = req.body;   

    const existingUser = await User.findOne({ 
        $or: [{email}, {username}]  
     })

     if(existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
     } 

     const user = await User.create({username, email, password, FullName, role, isEmailVerified: false})

     const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

     user.emailVerificationToken = hashedToken;
     user.emailVerificationExpiry = tokenExpiry;

     await user.save({validateBeforeSave: false});
     await sendEmail({
        to: user?.email,
        subject: "Email Verification - CORP",
        mailgenContent: emamilVerificationMailgenContent(user.username, `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/$token=${unhashedToken}`),

     });

     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry"
     );

     if(!createdUser) {
        throw new ApiError(500, "something went wrong while creating user");
     }

     return res.status(201).json(new ApiResponse(200, {user: createdUser}, "User registered successfully. Please check your email to verify your account."));

    });

    export {registerUser};