// Importing packages
import Joi from 'joi';
import crypto from 'crypto';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

// Importing helpers
import { generateUUID } from '../helpers/uuid.helper';

// Importing models
import documentModel from '../models/document.model';
import documentMemberModel from '../models/document-member.model';
import activityLogModel from '../models/activity-log.model';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description This function is used to generate a unique shareable token for a document
 */

const handleGenerateShareLink = async (req: Request, res: Response) => {
  try {
    const documentId = req.params.documentId as string;

    const ownerMembership = await documentMemberModel.findOne({
      documentId,
      ...(req.userId && { userId: req.userId }),
      role: 'owner' as const
    });

    if (!ownerMembership) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: httpStatusConstant.FORBIDDEN,
        code: HttpStatusCode.Forbidden,
        message: responseMessageConstant.ONLY_OWNER_CAN_INVITE
      });
    }

    const shareToken = crypto.randomBytes(32).toString('hex');

    await documentModel.findOneAndUpdate({ documentId: documentId as string }, { shareToken });

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.SHARE_LINK_GENERATED,
      data: { shareToken }
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
 * @createdAt 2026-04-03
 * @description This function is used to join a document via a shareable link token
 */

const handleJoinViaShareLink = async (req: Request, res: Response) => {
  try {
    const joinSchema = Joi.object({
      shareToken: Joi.string().required()
    });

    const { error, value } = joinSchema.validate(req.body);

    if (error) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: error.details[0]?.message.replace(/"/g, '')
      });
    }

    const document = await documentModel.findOne({ shareToken: value.shareToken });

    if (!document) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.SHARE_LINK_INVALID
      });
    }

    const existingMember = await documentMemberModel.findOne({
      documentId: document.documentId,
      userId: req.userId
    });

    if (existingMember) {
      return res.status(HttpStatusCode.Ok).json({
        status: httpStatusConstant.OK,
        code: HttpStatusCode.Ok,
        message: responseMessageConstant.ALREADY_A_MEMBER,
        data: { documentId: document.documentId }
      });
    }

    await documentMemberModel.create({
      memberId: generateUUID(),
      ...(document.documentId && { documentId: document.documentId }),
      ...(req.userId && { userId: req.userId }),
      role: 'viewer',
      ...(document.ownerId && { invitedBy: document.ownerId }),
      invitedAt: new Date()
    });

    await activityLogModel.create({
      logId: generateUUID(),
      documentId: document.documentId!,
      userId: req.userId!,
      action: 'joined',
      timestamp: new Date()
    });

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.JOINED_VIA_LINK,
      data: { documentId: document.documentId }
    });
  } catch (err: any) {
    return res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError,
      message: responseMessageConstant.SOMETHING_WENT_WRONG
    });
  }
};

export default {
  handleGenerateShareLink,
  handleJoinViaShareLink
};
