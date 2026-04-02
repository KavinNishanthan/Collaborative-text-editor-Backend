// Importing packages
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

// Importing models
import userModel from '../models/user.model';
import activityLogModel from '../models/activity-log.model';
import documentMemberModel from '../models/document-member.model';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to get all activity logs for a document
 */

const handleGetActivityLog = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params as { documentId: string };

    const membership = await documentMemberModel.findOne({
      documentId,
      userId: req.userId
    });

    if (!membership) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: httpStatusConstant.FORBIDDEN,
        code: HttpStatusCode.Forbidden,
        message: responseMessageConstant.DOCUMENT_ACCESS_DENIED
      });
    }

    const logs = await activityLogModel
      .find({ documentId })
      .sort({ timestamp: -1 });

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await userModel
          .findOne({ userId: log.userId })
          .select('name profilePicture username -_id');
        return { ...log.toObject(), user };
      })
    );

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.ACTIVITY_FETCHED,
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

export default {
  handleGetActivityLog
};
