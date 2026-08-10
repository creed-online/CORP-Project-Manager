import {Router} from 'express';
import {registerUser, login, logoutUser} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//Unsecured Route
router.route('/register').post(userRegisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, login);
router.route('/verify-email/:verificationToken')
.get(verifyEmail);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/forgot-password').post(userForgotPasswordValidator(), validate, forgotPasswordRequest); 
router.route('/reset-password/:resetToken').post(userResetPasswordValidator(), validate, resetForgotPassword);

//Secure route
router.route('/logout').post(verifyJWT, logoutUser);


export default router;