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

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to remove a member from a document (owner only)
 */

const handleRemoveMember = async (req: Request, res: Response) => {
  try {
    const { documentId, memberId } = req.params as { documentId: string; memberId: string };

    const ownerMembership = await documentMemberModel.findOne({
      documentId,
      userId: req.userId,
      role: 'owner'
    });

    if (!ownerMembership) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: httpStatusConstant.FORBIDDEN,
        code: HttpStatusCode.Forbidden,
        message: responseMessageConstant.ONLY_OWNER_CAN_REMOVE
      });
    }

    const targetMember = await documentMemberModel.findOne({ memberId, documentId });

    if (!targetMember) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.MEMBER_NOT_FOUND
      });
    }

    if (targetMember.role === 'owner') {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: responseMessageConstant.CANNOT_REMOVE_OWNER
      });
    }

    await documentMemberModel.deleteOne({ memberId });

    await activityLogModel.create({
      logId: generateUUID(),
      documentId,
      userId: req.userId,
      action: 'removed',
      metadata: targetMember.userId!,
      timestamp: new Date()
    });

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.MEMBER_REMOVED
    });
  } catch (err: any) {
    return res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError,
      message: responseMessageConstant.SOMETHING_WENT_WRONG
    });
  }
};


/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to update a member's role (owner only)
 */

const handleUpdateMemberRole = async (req: Request, res: Response) => {
  try {
    const { documentId, memberId } = req.params as { documentId: string; memberId: string };

    const updateRoleSchema = Joi.object({
      role: Joi.string().valid('editor', 'viewer').required()
    });

    const { error, value } = updateRoleSchema.validate(req.body);

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
        message: responseMessageConstant.ONLY_OWNER_CAN_UPDATE_ROLE
      });
    }

    const targetMember = await documentMemberModel.findOne({ memberId, documentId });

    if (!targetMember) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.MEMBER_NOT_FOUND
      });
    }

    await documentMemberModel.findOneAndUpdate({ memberId }, { role: value.role });

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.MEMBER_ROLE_UPDATED
    });
  } catch (err: any) {
    return res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError,
      message: responseMessageConstant.SOMETHING_WENT_WRONG
    });
  }
};

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to get all members of a document with user details
 */

const handleGetAllMembers = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params as { documentId: string };

    const callerMembership = await documentMemberModel.findOne({
      documentId,
      userId: req.userId
    });

    if (!callerMembership) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: httpStatusConstant.FORBIDDEN,
        code: HttpStatusCode.Forbidden,
        message: responseMessageConstant.DOCUMENT_ACCESS_DENIED
      });
    }

    const members = await documentMemberModel.find({ documentId });

    const enriched = await Promise.all(
      members.map(async (member) => {
        const user = await userModel
          .findOne({ userId: member.userId! })
          .select('name email profilePicture username -_id');
        return {
          ...member.toObject(),
          user
        };
      })
    );

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      data: enriched
    });
  } catch (err: any) {
    return res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError,
      message: responseMessageConstant.SOMETHING_WENT_WRONG
    });
  }
};


export default{handleInviteMember , handleRemoveMember, handleUpdateMemberRole , handleGetAllMembers}