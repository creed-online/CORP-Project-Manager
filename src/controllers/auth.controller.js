import mongoose from "mongoose";
import {User} from "../models/user-models.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import {sendEmail, emamilVerificationMailgenContent, forgotPasswordMailgenContent} from "../utils/mail.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const ensureDatabaseReady = () => {
    if (mongoose.connection.readyState !== 1) {
        throw new ApiError(503, "Database is currently unavailable. Please try again shortly.");
    }
};

const generatAccessandRefreshToken = async (userId) => {
    ensureDatabaseReady();

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
    ensureDatabaseReady();

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


    const login = asyncHandler(async (req, res) => {
        ensureDatabaseReady();

        const {email, password, username} = req.body;

        if(!email) {
            throw new ApiError(400, "Please provide email or username");
        }   

        const user = await User.findOne({email});

        if(!user) {
            throw new ApiError(404, "User not found with this email");
        }   

        const isPasswordValid = await user.isPasswordCorrect(password);
         if(!isPasswordValid) {
            throw new ApiError(401, "Invalid credentials"); 
         }

        const {accessToken, refreshToken} = await generatAccessandRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry"
               );
         

            const options = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                path: '/',
            }

         return res.status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
         .json(new ApiResponse(200, {user: loggedInUser, refreshToken, accessToken}, "User logged in successfully"));

    });

    const logoutUser = asyncHandler(async (req, res) => {
        ensureDatabaseReady();

        await User.findByIdAndUpdate(
            req.user._id, 
            {
                $set:{
                    refreshToken: null,
                }
            },
            {new: true}
        );

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        }

        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));

    });

    const getCurrentUser = asyncHandler(async (req, res) => {
        ensureDatabaseReady();

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current user fetched successfully"
            )
        )
    })

    const verifyEmail = asyncHandler(async (req, res) => {
        ensureDatabaseReady();

        const {verificationToken} = req.params

        if(!verificationToken) {
            throw new ApiError(400, "Verification token is missing");
        }

        let hashedToken =crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: {$gt: Date.now()},
        });

        if(!user) {
            throw new ApiError(400, "Invalid or expired verification token");
        }

        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;

        user.isEmailVerified = true;
        await user.save({validateBeforeSave: false});

        return res
        .status(200)
        .json(new ApiResponse(
            200,
             {
                isEmailVerified: user.isEmailVerified,
             },
              "Email verified successfully. You can now login to your account.")); 
    })

    const resendVerificationEmail = asyncHandler(async (req, res) => {
        ensureDatabaseReady();

        const user = await User.findById(req.user._id);

        if(!user) {
            throw new ApiError(404, "User not found");
        }
        
        if(user.isEmailVerified) {
            throw new ApiError(400, "Email is already verified");
        }


     const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

     user.emailVerificationToken = hashedToken;
     user.emailVerificationExpiry = tokenExpiry;

     await user.save({validateBeforeSave: false});

     await sendEmail({
        to: user?.email,
        subject: "Email Verification - CORP",
        mailgenContent: emamilVerificationMailgenContent(user.username, `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/$token=${unhashedToken}`),

     });

        // Logic for resending verification email would go here
            return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                "Verification email resent successfully. Please check your email."
            )); 
    })

    const refreshAccessToken = asyncHandler(async (req, res) => {
       ensureDatabaseReady();

       const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

       if(!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is missing");
       }


    try {

     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
     const user = await User.findById(decodedToken?._id)

        if(!user) {
            throw new ApiError(404, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token Expired");
        }       

        const options = {
            httpOnly: true,
            secure: true,
        }

        const {accessToken, refreshToken: newRefreshToken} = await generatAccessandRefreshToken(user._id);

        user.refreshToken = newRefreshToken;
        await user.save({validateBeforeSave: false});

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully"));

       }
       catch (error) {      
          throw new ApiError(401, "Invalid refresh token");
       }

    })

    const forgotPassword = asyncHandler(async (req, res) => {
        ensureDatabaseReady();

        const {email} = req.body;

        const user = await User.findOne({email})

        if(!user) {
            throw new ApiError(404, "User not found with this email");
        }

        const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordExpiry = tokenExpiry;

        await user.save({validateBeforeSave: false});

        await sendEmail({
            to: user?.email,
            subject: "Password Reset - CORP",
            mailgenContent: forgotPasswordMailgenContent(user.username, `${process.env.FORGOT_PASSWORD_URL}/$token=${unhashedToken}`),
        });

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                "Password reset email sent successfully. Please check your email."
            ));
    })

    const changeCurrentPassword = asyncHandler(async (req, res) => {
        ensureDatabaseReady();

        const {oldPassword, newPassword} = req.body;

        const user = await User.findById(req.user._id);

        const isPasswordValid = await user.isPasswordCorrect(oldPassword);

        if(!isPasswordValid) {
            throw new ApiError(401, "Old password is incorrect");
        }

        user.password = newPassword;
        await user.save({validateBeforeSave: false});

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Password changed successfully"
        ));
    })

    const resetForgotPassword = asyncHandler(async (req, res) => {
        ensureDatabaseReady();

        const {resetToken} = req.params;
        const {password} = req.body;

        if (!resetToken) {
            throw new ApiError(400, "Reset token is missing");
        }

        if (!password) {
            throw new ApiError(400, "New password is required");
        }

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        const user = await User.findOne({
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            throw new ApiError(400, "Invalid or expired reset token");
        }

        user.password = password;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;

        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password reset successfully"));
    })

    export {registerUser,
            login,
            logoutUser,
            getCurrentUser, 
            verifyEmail, 
            resendVerificationEmail, 
            refreshAccessToken,
            forgotPassword,
            changeCurrentPassword,
            resetForgotPassword
        };