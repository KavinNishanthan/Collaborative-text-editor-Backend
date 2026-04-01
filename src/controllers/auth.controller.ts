// Importing packges
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

// Importing helpers
import { generateOTP } from '../helpers/otp.helper';
import { sendOtpMail } from '../helpers/mail.helper';
import { generateUUID } from '../helpers/uuid.helper';
import { generateColor } from '../helpers/profile-colour.helper';

// Importing models
import otpModel from '../models/otp.model';
import userModel from '../models/user.model';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';



/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to handle user registration and send OTP to email
 */

const handleRegisterAndSendOtp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userValidation = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required()
    });

    const { error } = userValidation.validate(req.body);

    if (error) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: error.details[0]?.message.replace(/"/g, '')
      });
    }

    const checkIsUserExists = await userModel
      .findOne({ email })
      .select('email -_id');

    if (checkIsUserExists) {
      return res.status(HttpStatusCode.Conflict).json({
        status: httpStatusConstant.CONFLICT,
        code: HttpStatusCode.Conflict,
        message: responseMessageConstant.USER_ALREADY_EXISTS
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();

    await otpModel.create({
      email,
      otp,
      name,
      password: encryptedPassword,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    const mailSent = await sendOtpMail(email, otp);

    if (!mailSent) {
      return res.status(HttpStatusCode.InternalServerError).json({
        status: httpStatusConstant.ERROR,
        code: HttpStatusCode.InternalServerError,
        message: responseMessageConstant.SOMETHING_WENT_WRONG
      });
    }

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.OTP_SENT
    });

  } catch (err: any) {
    res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError,
      message:err.message
    });
  }
};


/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to handle OTP verification and create user in DB
 */


const handleVerifyOtpAndRegister = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const otpValidation = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(6).required()
    });

    const { error } = otpValidation.validate(req.body);

    if (error) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: error.details[0]?.message.replace(/"/g, '')
      });
    }

    const otpRecord = await otpModel.findOne({ email });

    if (!otpRecord) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.OTP_INVALID
      });
    }

    if (otpRecord.expiresAt && otpRecord.expiresAt < new Date()) {
      await otpModel.deleteOne({ email });
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: responseMessageConstant.OTP_EXPIRED
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: responseMessageConstant.OTP_INVALID
      });
    }

    const otpDataValidation = Joi.object({
      name: Joi.string().required(),
      password: Joi.string().required()
    });

    const { error: otpDataError, value } = otpDataValidation.validate({
      name: otpRecord.name,
      password: otpRecord.password
    });

    if (otpDataError) {
      return res.status(HttpStatusCode.InternalServerError).json({
        status: httpStatusConstant.ERROR,
        code: HttpStatusCode.InternalServerError,
        message: responseMessageConstant.SOMETHING_WENT_WRONG
      });
    }

    const generatedUserId = generateUUID();

    await userModel.create({
      userId: generatedUserId,
      name: value.name,
      email,
      password: value.password,
      isManualAuth: true,
      profilePicture: `https://api.dicebear.com/7.x/initials/png?seed=${value.name}&backgroundColor=${generateColor(value.name)}`
    });

    await otpModel.deleteOne({ email });

    return res.status(HttpStatusCode.Created).json({
      status: httpStatusConstant.CREATED,
      code: HttpStatusCode.Created,
      message: responseMessageConstant.USER_CREATED
    });

  } catch (err: any) {
    res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError
    });
  }
};


export default{ handleRegisterAndSendOtp, handleVerifyOtpAndRegister }