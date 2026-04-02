// Importing packages
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

// Importing helpers
import { generateUUID } from '../helpers/uuid.helper';

// Importing models
import invitationModel from '../models/invitation.model';
import documentModel from '../models/document.model';
import documentMemberModel from '../models/document-member.model';
import userModel from '../models/user.model';
import activityLogModel from '../models/activity-log.model';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Get all pending invitations for the authenticated user
 */

const handleGetPendingInvitations = async (req: Request, res: Response) => {
  try {
    const invitations = await invitationModel
      .find({ inviteeUserId: req.userId, status: 'pending' })
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      invitations.map(async (inv) => {
        const doc = await documentModel.findOne({ documentId: inv.documentId });
        const inviter = await userModel.findOne({ userId: inv.invitedBy });
        return {
          invitationId: inv.invitationId,
          documentId: inv.documentId,
          documentTitle: doc?.title || 'Untitled Document',
          inviterName: inviter?.name || inviter?.email || 'Someone',
          inviterEmail: inviter?.email || '',
          role: inv.role,
          createdAt: inv.createdAt
        };
      })
    );

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.INVITATIONS_FETCHED,
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


/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Accept a pending invitation — adds the user as a document member
 */
const handleAcceptInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params as { invitationId: string };

    const invitation = await invitationModel.findOne({
      invitationId,
      inviteeUserId: req.userId
    });

    if (!invitation) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.INVITATION_NOT_FOUND
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: responseMessageConstant.INVITATION_ALREADY_HANDLED
      });
    }

  
    const existing = await documentMemberModel.findOne({
      documentId: invitation.documentId,
      userId: req.userId
    });

    if (!existing) {
      await documentMemberModel.create({
        memberId: generateUUID(),
        documentId: invitation.documentId,
        userId: req.userId!,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        invitedAt: new Date()
      });
    }

    await invitationModel.findOneAndUpdate(
      { invitationId },
      { status: 'accepted' }
    );


    await activityLogModel.create({
      logId: generateUUID(),
      documentId: invitation.documentId,
      userId: req.userId!,
      action: 'joined',
      timestamp: new Date()
    });

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.INVITATION_ACCEPTED,
      data: { documentId: invitation.documentId }
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
 * @description Decline a pending invitation
 */
const handleDeclineInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params as { invitationId: string };

    const invitation = await invitationModel.findOne({
      invitationId,
      inviteeUserId: req.userId
    });

    if (!invitation) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.INVITATION_NOT_FOUND
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: responseMessageConstant.INVITATION_ALREADY_HANDLED
      });
    }

    await invitationModel.findOneAndUpdate(
      { invitationId },
      { status: 'declined' }
    );

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.INVITATION_DECLINED
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
  handleGetPendingInvitations,
  handleAcceptInvitation,
  handleDeclineInvitation
};
