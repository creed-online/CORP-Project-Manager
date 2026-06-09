import {User} from "../models/user-models.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import {sendEmail, emamilVerificationMailgenContent} from "../utils/mail.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";



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


    const login = asyncHandler(async (req, res) => {
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
            secure: true,
         }

         return res.status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
         .json(new ApiResponse(200, {user: loggedInUser, refreshToken, accessToken}, "User logged in successfully"));

    });

    const logoutUser = asyncHandler(async (req, res) => {
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
            secure: true,
        }

        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));

    });

    const getCurrentUser = asyncHandler(async (req, res) => {
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


    export {registerUser, login, logoutUser, getCurrentUser};