// Importing packages
import Joi from 'joi';
import crypto from 'crypto';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

// Importing helpers
import { generateUUID } from '../helpers/uuid.helper';
import { sendInviteMail } from '../helpers/mail.helper';

// Importing models
import userModel from '../models/user.model';
import documentModel from '../models/document.model';
import activityLogModel from '../models/activity-log.model';
import documentMemberModel from '../models/document-member.model';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';

/**
 * @createdBy Kavin Nishanthan P D
 * @updatedAt 2026-04-02
 * @description This function is used to invite a member to a document by email.
 *              It checks if the email is registered, generates a share link,
 *              and sends an invite email. The member is added only when they click the link.
 */

const handleInviteMember = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params as { documentId: string };

    const invite = Joi.object({
      email: Joi.string().email().required(),
      role: Joi.string().valid('editor', 'viewer').required()
    });

    const { error, value } = invite.validate(req.body);

    if (error) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: error.details[0]?.message.replace(/"/g, '')
      });
    }

    const ownerMembership = await documentMemberModel.findOne({
      documentId,
      userId: req.userId,
      role: 'owner'
    });

    if (!ownerMembership) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: httpStatusConstant.FORBIDDEN,
        code: HttpStatusCode.Forbidden,
        message: responseMessageConstant.ONLY_OWNER_CAN_INVITE
      });
    }

    const targetUser = await userModel.findOne({ email: value.email });

    if (!targetUser) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.USER_NOT_REGISTERED
      });
    }


    const existingMember = await documentMemberModel.findOne({
      documentId,
      userId: targetUser.userId!
    });

    if (existingMember) {
      return res.status(HttpStatusCode.Conflict).json({
        status: httpStatusConstant.CONFLICT,
        code: HttpStatusCode.Conflict,
        message: responseMessageConstant.MEMBER_ALREADY_EXISTS
      });
    }

    const shareToken = crypto.randomBytes(32).toString('hex');
    await documentModel.findOneAndUpdate({ documentId }, { shareToken });


    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const joinLink = `${clientUrl}/join/${shareToken}`;

    const inviter = await userModel.findOne({ userId: req.userId });
    const document = await documentModel.findOne({ documentId });
    const inviterName = inviter?.name || 'Someone';
    const documentTitle = document?.title || 'Untitled Document';

    const mailSent = await sendInviteMail(value.email, inviterName, documentTitle, joinLink);

    if (!mailSent) {
      return res.status(HttpStatusCode.InternalServerError).json({
        status: httpStatusConstant.ERROR,
        code: HttpStatusCode.InternalServerError,
        message: responseMessageConstant.INVITE_MAIL_FAILED
      });
    }

    await activityLogModel.create({
      logId: generateUUID(),
      documentId,
      userId: req.userId,
      action: 'invited',
      metadata: targetUser.userId!,
      timestamp: new Date()
    });

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.INVITE_SENT
    });
  } catch (err: any) {
    return res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError,
      message: responseMessageConstant.SOMETHING_WENT_WRONG
    });
  }
};

export default{handleInviteMember}