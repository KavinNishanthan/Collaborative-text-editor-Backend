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

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to update the document title (owner only)
 */

const handleUpdateDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params as { documentId: string };

    const updateDocumentSchema = Joi.object({
      title: Joi.string().required()
    });

    const { error, value } = updateDocumentSchema.validate(req.body);

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
        message: responseMessageConstant.ONLY_OWNER_CAN_UPDATE_DOCUMENT
      });
    }

    await documentModel.findOneAndUpdate(
      { documentId },
      {
        title: value.title,
        lastEditedBy: req.userId!,
        lastEditedAt: new Date()
      }
    );

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      message: responseMessageConstant.DOCUMENT_UPDATED
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
 * @description This function is used to get all documents where logged-in user has access
 */

const handleGetAllDocuments = async (req: Request, res: Response) => {
  try {
    const memberships = await documentMemberModel.find({ userId: req.userId });
    const documentIds = memberships.map((m) => m.documentId).filter((id): id is string => !!id);

    const documents = await documentModel.find({ documentId: { $in: documentIds } });

    const enriched = documents.map((doc) => {
      const membership = memberships.find((m) => m.documentId === doc.documentId);
      return {
        ...doc.toObject(),
        role: membership?.role
      };
    });

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
 * @createdAt 2026-04-02
 * @description This function is used to get a single document with members populated
 */

const handleGetDocumentById = async (req: Request, res: Response) => {
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

    const document = await documentModel.findOne({ documentId });

    if (!document) {
      return res.status(HttpStatusCode.NotFound).json({
        status: httpStatusConstant.NOT_FOUND,
        code: HttpStatusCode.NotFound,
        message: responseMessageConstant.DOCUMENT_NOT_FOUND
      });
    }

    const members = await documentMemberModel.find({ documentId });

    return res.status(HttpStatusCode.Ok).json({
      status: httpStatusConstant.OK,
      code: HttpStatusCode.Ok,
      data: {
        ...document.toObject(),
        role: membership.role,
        members
      }
    });
  } catch (err: any) {
    return res.status(HttpStatusCode.InternalServerError).json({
      status: httpStatusConstant.ERROR,
      code: HttpStatusCode.InternalServerError,
      message: responseMessageConstant.SOMETHING_WENT_WRONG
    });
  }
};




export default { handleCreateDocument ,handleUpdateDocument , handleGetAllDocuments, handleGetDocumentById};