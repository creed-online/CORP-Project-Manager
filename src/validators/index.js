import { body } from "express-validator";
import { AvailableRoles } from "../utils/constants.js";


const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lower case")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("FullName").trim().notEmpty().withMessage("FullName is required"),
  ];
}; 

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"), 
    body("password").trim().notEmpty().withMessage("Password is required"),
  ]
}

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").trim().notEmpty().withMessage("Old Password is required"),
    body("newPassword").trim().notEmpty().withMessage("New Password is required"),
  ]
}

const userForgotPasswordValidator = () => {
  return [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid"),
  ]
}

const userResetPasswordValidator = () => {
  return [
    body("password").trim().notEmpty().withMessage("Password is required"),
  ]
}

const createProjectValidator = () => {
  return [
    body("name")
    .notEmpty()
    .withMessage("Project name is required"),
    body("description")
    .optional()
  ]
}

const addMemberToProjectValidator = () => {
  return [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
    body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(AvailableRoles)
    .withMessage("Role is invalid. Available roles are: " + AvailableRoles.join(", "))
  ]
}

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetPasswordValidator,
  createProjectValidator,
  addMemberToProjectValidator
};
