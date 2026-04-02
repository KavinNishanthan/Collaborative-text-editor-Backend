"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packges
const joi_1 = __importDefault(require("joi"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = require("axios");
// Importing helpers
const otp_helper_1 = require("../helpers/otp.helper");
const mail_helper_1 = require("../helpers/mail.helper");
const uuid_helper_1 = require("../helpers/uuid.helper");
const cookie_helper_1 = require("../helpers/cookie.helper");
const profile_colour_helper_1 = require("../helpers/profile-colour.helper");
// Importing models
const otp_model_1 = __importDefault(require("../models/otp.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Importing constants
const http_message_constant_1 = __importDefault(require("../constants/http-message.constant"));
const response_message_constant_1 = __importDefault(require("../constants/response-message.constant"));
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to handle user registration and send OTP to email
 */
const handleRegisterAndSendOtp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userValidation = joi_1.default.object({
            name: joi_1.default.string().required(),
            email: joi_1.default.string().required(),
            password: joi_1.default.string().required()
        });
        const { error } = userValidation.validate(req.body);
        if (error) {
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                status: http_message_constant_1.default.BAD_REQUEST,
                code: axios_1.HttpStatusCode.BadRequest,
                message: error.details[0]?.message.replace(/"/g, '')
            });
        }
        const checkIsUserExists = await user_model_1.default
            .findOne({ email })
            .select('email -_id');
        if (checkIsUserExists) {
            return res.status(axios_1.HttpStatusCode.Conflict).json({
                status: http_message_constant_1.default.CONFLICT,
                code: axios_1.HttpStatusCode.Conflict,
                message: response_message_constant_1.default.USER_ALREADY_EXISTS
            });
        }
        const encryptedPassword = await bcryptjs_1.default.hash(password, 10);
        const otp = (0, otp_helper_1.generateOTP)();
        await otp_model_1.default.create({
            email,
            otp,
            name,
            password: encryptedPassword,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        const mailSent = await (0, mail_helper_1.sendOtpMail)(email, otp);
        if (!mailSent) {
            return res.status(axios_1.HttpStatusCode.InternalServerError).json({
                status: http_message_constant_1.default.ERROR,
                code: axios_1.HttpStatusCode.InternalServerError,
                message: response_message_constant_1.default.SOMETHING_WENT_WRONG
            });
        }
        return res.status(axios_1.HttpStatusCode.Ok).json({
            status: http_message_constant_1.default.OK,
            code: axios_1.HttpStatusCode.Ok,
            message: response_message_constant_1.default.OTP_SENT
        });
    }
    catch (err) {
        res.status(axios_1.HttpStatusCode.InternalServerError).json({
            status: http_message_constant_1.default.ERROR,
            code: axios_1.HttpStatusCode.InternalServerError,
            message: err.message
        });
    }
};
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to handle OTP verification and create user in DB
 */
const handleVerifyOtpAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpValidation = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            otp: joi_1.default.string().length(6).required()
        });
        const { error } = otpValidation.validate(req.body);
        if (error) {
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                status: http_message_constant_1.default.BAD_REQUEST,
                code: axios_1.HttpStatusCode.BadRequest,
                message: error.details[0]?.message.replace(/"/g, '')
            });
        }
        const otpRecord = await otp_model_1.default.findOne({ email });
        if (!otpRecord) {
            return res.status(axios_1.HttpStatusCode.NotFound).json({
                status: http_message_constant_1.default.NOT_FOUND,
                code: axios_1.HttpStatusCode.NotFound,
                message: response_message_constant_1.default.OTP_INVALID
            });
        }
        if (otpRecord.expiresAt && otpRecord.expiresAt < new Date()) {
            await otp_model_1.default.deleteOne({ email });
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                status: http_message_constant_1.default.BAD_REQUEST,
                code: axios_1.HttpStatusCode.BadRequest,
                message: response_message_constant_1.default.OTP_EXPIRED
            });
        }
        if (otpRecord.otp !== otp) {
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                status: http_message_constant_1.default.BAD_REQUEST,
                code: axios_1.HttpStatusCode.BadRequest,
                message: response_message_constant_1.default.OTP_INVALID
            });
        }
        const otpDataValidation = joi_1.default.object({
            name: joi_1.default.string().required(),
            password: joi_1.default.string().required()
        });
        const { error: otpDataError, value } = otpDataValidation.validate({
            name: otpRecord.name,
            password: otpRecord.password
        });
        if (otpDataError) {
            return res.status(axios_1.HttpStatusCode.InternalServerError).json({
                status: http_message_constant_1.default.ERROR,
                code: axios_1.HttpStatusCode.InternalServerError,
                message: response_message_constant_1.default.SOMETHING_WENT_WRONG
            });
        }
        const generatedUserId = (0, uuid_helper_1.generateUUID)();
        await user_model_1.default.create({
            userId: generatedUserId,
            name: value.name,
            email,
            password: value.password,
            isManualAuth: true,
            isEmailVerified: true,
            profilePicture: `https://api.dicebear.com/7.x/initials/png?seed=${value.name.replace(/\s+/g, '')}&backgroundColor=${(0, profile_colour_helper_1.generateColor)(value.name)}`
        });
        await otp_model_1.default.deleteOne({ email });
        return res.status(axios_1.HttpStatusCode.Created).json({
            status: http_message_constant_1.default.CREATED,
            code: axios_1.HttpStatusCode.Created,
            message: response_message_constant_1.default.USER_CREATED
        });
    }
    catch (err) {
        res.status(axios_1.HttpStatusCode.InternalServerError).json({
            status: http_message_constant_1.default.ERROR,
            code: axios_1.HttpStatusCode.InternalServerError
        });
    }
};
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to handle user login
 */
const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const loginValidation = joi_1.default.object({
            email: joi_1.default.string().required(),
            password: joi_1.default.string().required()
        });
        const { error } = loginValidation.validate(req.body);
        if (error) {
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                status: http_message_constant_1.default.BAD_REQUEST,
                code: axios_1.HttpStatusCode.BadRequest,
                message: error.details[0]?.message.replace(/"/g, '')
            });
        }
        const user = await user_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(axios_1.HttpStatusCode.NotFound).json({
                status: http_message_constant_1.default.NOT_FOUND,
                code: axios_1.HttpStatusCode.NotFound,
                message: response_message_constant_1.default.USER_NOT_FOUND
            });
        }
        if (!user.isManualAuth) {
            return res.status(axios_1.HttpStatusCode.Unauthorized).json({
                status: http_message_constant_1.default.UNAUTHORIZED,
                code: axios_1.HttpStatusCode.Unauthorized,
                message: response_message_constant_1.default.ACCOUNT_ASSOCIATED_WITH_GOOGLE
            });
        }
        if (!user.isActive) {
            return res.status(axios_1.HttpStatusCode.Forbidden).json({
                status: http_message_constant_1.default.FORBIDDEN,
                code: axios_1.HttpStatusCode.Forbidden,
                message: response_message_constant_1.default.ACCOUNT_DEACTIVATED
            });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(axios_1.HttpStatusCode.Unauthorized).json({
                status: http_message_constant_1.default.UNAUTHORIZED,
                code: axios_1.HttpStatusCode.Unauthorized,
                message: response_message_constant_1.default.INVALID_CREDENTIALS
            });
        }
        (0, cookie_helper_1.setAuthCookie)(res, user.userId, user.email);
        const { password: _pwd, ...userData } = user.toObject();
        return res.status(axios_1.HttpStatusCode.Ok).json({
            status: http_message_constant_1.default.OK,
            code: axios_1.HttpStatusCode.Ok,
            message: response_message_constant_1.default.LOGIN_SUCCESS,
            data: userData
        });
    }
    catch (err) {
        return res.status(axios_1.HttpStatusCode.InternalServerError).json({
            status: http_message_constant_1.default.ERROR,
            code: axios_1.HttpStatusCode.InternalServerError,
            message: err?.message
        });
    }
};
exports.default = { handleRegisterAndSendOtp, handleVerifyOtpAndRegister, handleLogin };
//# sourceMappingURL=auth.controller.js.map