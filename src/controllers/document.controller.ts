// Importing packages
import Joi from 'joi';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

// Importing helpers
import { generateUUID } from '../helpers/uuid.helper';

// Importing models
import documentModel from '../models/document.model';
import documentMemberModel from '../models/document-member.model';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';


/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to handle document creation and auto-assign owner role
 */

const handleCreateDocument = async (req: Request, res: Response) => {
  try {
    const createDocument = Joi.object({
      title: Joi.string().optional()
    });

    const { error, value } = createDocument.validate(req.body);

    if (error) {
      return res.status(HttpStatusCode.BadRequest).json({
        status: httpStatusConstant.BAD_REQUEST,
        code: HttpStatusCode.BadRequest,
        message: error.details[0]?.message.replace(/"/g, '')
      });
    }

    const documentId = generateUUID();
    const memberId = generateUUID();

    const document = await documentModel.create({
      documentId,
      title: value.title || 'Untitled Document',
      content: '',
      ownerId: req.userId!
    });

    await documentMemberModel.create({
      memberId,
      documentId,
      userId: req.userId!,
      role: 'owner',
      invitedBy: req.userId!,
      invitedAt: new Date()
    });

    return res.status(HttpStatusCode.Created).json({
      status: httpStatusConstant.CREATED,
      code: HttpStatusCode.Created,
      message: responseMessageConstant.DOCUMENT_CREATED,
      data: document
    });
  } catch (err: any) {
    return res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError,
      message: responseMessageConstant.SOMETHING_WENT_WRONG
    });
  }
};

export default { handleCreateDocument };