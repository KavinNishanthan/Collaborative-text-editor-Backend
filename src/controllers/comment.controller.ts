// Importing packages
import Joi from 'joi';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

// Importing helpers
import { generateUUID } from '../helpers/uuid.helper';

// Importing models
import userModel from '../models/user.model';
import commentModel from '../models/comment.model';
import documentMemberModel from '../models/document-member.model';
import activityLogModel from '../models/activity-log.model';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description This function is used to add a comment to a selected text range in a document
 */

const handleAddComment = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params as { documentId: string };

    const addCommentSchema = Joi.object({
      content: Joi.string().required(),
      selectedText: Joi.string().optional().allow(''),
      rangeStart: Joi.number().optional(),
      rangeEnd: Joi.number().optional()
    });

    const { error, value } = addCommentSchema.validate(req.body);

    if (error) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: error.details[0]?.message.replace(/"/g, '')
      });
    }

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

    const comment = await commentModel.create({
      commentId: generateUUID(),
      documentId,
      userId: req.userId!,
      content: value.content,
      selectedText: value.selectedText,
      rangeStart: value.rangeStart,
      rangeEnd: value.rangeEnd,
      isResolved: false,
      replies: []
    });

    await activityLogModel.create({
      logId: generateUUID(),
      documentId,
      userId: req.userId!,
      action: 'commented',
      metadata: comment.commentId,
      timestamp: new Date()
    });

    return res.status(HttpStatusCode.Created).json({
      status: httpStatusConstant.CREATED,
      code: HttpStatusCode.Created,
      message: responseMessageConstant.COMMENT_ADDED,
      data: comment
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
 * @description This function is used to add a threaded reply to an existing comment
 */

const handleReplyToComment = async (req: Request, res: Response) => {
  try {
    const { documentId, commentId } = req.params as { documentId: string; commentId: string };

    const replySchema = Joi.object({
      content: Joi.string().required()
    });

    const { error, value } = replySchema.validate(req.body);

    if (error) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: error.details[0]?.message.replace(/"/g, '')
      });
    }

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

    const comment = await commentModel.findOne({ commentId, documentId });

    if (!comment) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.COMMENT_NOT_FOUND
      });
    }

    const reply = {
      replyId: generateUUID(),
      userId: req.userId,
      content: value.content,
      createdAt: new Date()
    };

    comment.replies = comment.replies || [];
    comment.replies.push(reply as any);
    await comment.save();

    return res.status(HttpStatusCode.Created).json({
      status: httpStatusConstant.CREATED,
      code: HttpStatusCode.Created,
      message: responseMessageConstant.REPLY_ADDED,
      data: reply
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
 * @description This function is used to mark a comment as resolved
 */

const handleResolveComment = async (req: Request, res: Response) => {
  try {
    const { documentId, commentId } = req.params as { documentId: string; commentId: string };

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

    const comment = await commentModel.findOne({ commentId, documentId });

    if (!comment) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.COMMENT_NOT_FOUND
      });
    }

    await commentModel.findOneAndUpdate({ commentId }, { isResolved: true });

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.COMMENT_RESOLVED
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
 * @description This function is used to get all comments for a document
 */

const handleGetComments = async (req: Request, res: Response) => {
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

    const comments = await commentModel.find({ documentId }).sort({ createdAt: 1 });

    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const author = await userModel
          .findOne({ userId: comment.userId })
          .select('name profilePicture username -_id');
        return { ...comment.toObject(), author };
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

export default {
  handleAddComment,
  handleReplyToComment,
  handleResolveComment,
  handleGetComments
};
