// Importing packages
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

// Importing helpers
import { generateUUID } from '../helpers/uuid.helper';

// Importing models
import userModel from '../models/user.model';
import documentModel from '../models/document.model';
import documentMemberModel from '../models/document-member.model';
import documentHistoryModel from '../models/document-history.model';
import activityLogModel from '../models/activity-log.model';
import { clearInMemoryDoc } from '../configs/socket.config';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description This function is used to get all version history for a document
 */

const handleGetHistory = async (req: Request, res: Response) => {
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

    const history = await documentHistoryModel
      .find({ documentId })
      .sort({ version: -1 });

    // Manually populate editor user info
    const enriched = await Promise.all(
      history.map(async (entry: { editedBy: any; toObject: () => any; }) => {
        const user = await userModel
          .findOne({ userId: entry.editedBy })
          .select('name profilePicture username -_id');
        return { ...entry.toObject(), editedByUser: user };
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

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description This function is used to restore a document to a previous version
 */

const handleRestoreVersion = async (req: Request, res: Response) => {
  try {
    const { documentId, historyId } = req.params as { documentId: string; historyId: string };

    const membership = await documentMemberModel.findOne({
      documentId,
      userId: req.userId,
      role: { $in: ['owner', 'editor'] }
    });

    if (!membership) {
      return res.status(HttpStatusCode.Forbidden).json({
        status: httpStatusConstant.FORBIDDEN,
        code: HttpStatusCode.Forbidden,
        message: responseMessageConstant.DOCUMENT_ACCESS_DENIED
      });
    }

    const historyEntry = await documentHistoryModel.findOne({ historyId, documentId });

    if (!historyEntry) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.HISTORY_NOT_FOUND
      });
    }

    const restoredYjsState = Buffer.from(historyEntry.changes ?? '', 'base64');
    await documentModel.findOneAndUpdate(
      { documentId },
      {
        yjsState: restoredYjsState,
        content: historyEntry.content ?? '',
        lastEditedBy: req.userId!,
        lastEditedAt: new Date()
      }
    );

    const latestHistory = await documentHistoryModel
      .findOne({ documentId })
      .sort({ version: -1 });

    const nextVersion = (latestHistory?.version || 0) + 1;

    await documentHistoryModel.create({
      historyId: generateUUID(),
      documentId,
      editedBy: req.userId!,
      changes: historyEntry.changes ?? '',
      content: historyEntry.content ?? '',
      version: nextVersion,
      timestamp: new Date()
    });

    await activityLogModel.create({
      logId: generateUUID(),
      documentId,
      userId: req.userId!,
      action: 'restored',
      metadata: historyId,
      timestamp: new Date()
    });

    clearInMemoryDoc(documentId);

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.VERSION_RESTORED
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
  handleGetHistory,
  handleRestoreVersion
};
