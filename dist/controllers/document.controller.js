"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const joi_1 = __importDefault(require("joi"));
const axios_1 = require("axios");
// Importing helpers
const uuid_helper_1 = require("../helpers/uuid.helper");
// Importing models
const document_model_1 = __importDefault(require("../models/document.model"));
const activity_log_model_1 = __importDefault(require("../models/activity-log.model"));
const document_member_model_1 = __importDefault(require("../models/document-member.model"));
// Importing constants
const http_message_constant_1 = __importDefault(require("../constants/http-message.constant"));
const response_message_constant_1 = __importDefault(require("../constants/response-message.constant"));
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to handle document creation and auto-assign owner role
 */
const handleCreateDocument = async (req, res) => {
    try {
        const createDocument = joi_1.default.object({
            title: joi_1.default.string().optional()
        });
        const { error, value } = createDocument.validate(req.body);
        if (error) {
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                status: http_message_constant_1.default.BAD_REQUEST,
                code: axios_1.HttpStatusCode.BadRequest,
                message: error.details[0]?.message.replace(/"/g, '')
            });
        }
        const documentId = (0, uuid_helper_1.generateUUID)();
        const memberId = (0, uuid_helper_1.generateUUID)();
        const document = await document_model_1.default.create({
            documentId,
            title: value.title || 'Untitled Document',
            content: '',
            ownerId: req.userId
        });
        await document_member_model_1.default.create({
            memberId,
            documentId,
            userId: req.userId,
            role: 'owner',
            invitedBy: req.userId,
            invitedAt: new Date()
        });
        await activity_log_model_1.default.create({
            logId: (0, uuid_helper_1.generateUUID)(),
            documentId,
            userId: req.userId,
            action: 'joined',
            timestamp: new Date()
        });
        return res.status(axios_1.HttpStatusCode.Created).json({
            status: http_message_constant_1.default.CREATED,
            code: axios_1.HttpStatusCode.Created,
            message: response_message_constant_1.default.DOCUMENT_CREATED,
            data: document
        });
    }
    catch (err) {
        return res.status(axios_1.HttpStatusCode.InternalServerError).json({
            status: http_message_constant_1.default.ERROR,
            code: axios_1.HttpStatusCode.InternalServerError,
            message: response_message_constant_1.default.SOMETHING_WENT_WRONG
        });
    }
};
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to update the document title (owner only)
 */
const handleUpdateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const updateDocumentSchema = joi_1.default.object({
            title: joi_1.default.string().required()
        });
        const { error, value } = updateDocumentSchema.validate(req.body);
        if (error) {
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                status: http_message_constant_1.default.BAD_REQUEST,
                code: axios_1.HttpStatusCode.BadRequest,
                message: error.details[0]?.message.replace(/"/g, '')
            });
        }
        const ownerMembership = await document_member_model_1.default.findOne({
            documentId,
            userId: req.userId,
            role: 'owner'
        });
        if (!ownerMembership) {
            return res.status(axios_1.HttpStatusCode.Forbidden).json({
                status: http_message_constant_1.default.FORBIDDEN,
                code: axios_1.HttpStatusCode.Forbidden,
                message: response_message_constant_1.default.ONLY_OWNER_CAN_UPDATE_DOCUMENT
            });
        }
        await document_model_1.default.findOneAndUpdate({ documentId }, {
            title: value.title,
            lastEditedBy: req.userId,
            lastEditedAt: new Date()
        });
        return res.status(axios_1.HttpStatusCode.Ok).json({
            status: http_message_constant_1.default.OK,
            code: axios_1.HttpStatusCode.Ok,
            message: response_message_constant_1.default.DOCUMENT_UPDATED
        });
    }
    catch (err) {
        return res.status(axios_1.HttpStatusCode.InternalServerError).json({
            status: http_message_constant_1.default.ERROR,
            code: axios_1.HttpStatusCode.InternalServerError,
            message: response_message_constant_1.default.SOMETHING_WENT_WRONG
        });
    }
};
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to get all documents where logged-in user has access
 */
const handleGetAllDocuments = async (req, res) => {
    try {
        const memberships = await document_member_model_1.default.find({ userId: req.userId });
        const documentIds = memberships.map((m) => m.documentId).filter((id) => !!id);
        const documents = await document_model_1.default.find({ documentId: { $in: documentIds } });
        const enriched = documents.map((doc) => {
            const membership = memberships.find((m) => m.documentId === doc.documentId);
            return {
                ...doc.toObject(),
                role: membership?.role
            };
        });
        return res.status(axios_1.HttpStatusCode.Ok).json({
            status: http_message_constant_1.default.OK,
            code: axios_1.HttpStatusCode.Ok,
            data: enriched
        });
    }
    catch (err) {
        return res.status(axios_1.HttpStatusCode.InternalServerError).json({
            status: http_message_constant_1.default.ERROR,
            code: axios_1.HttpStatusCode.InternalServerError,
            message: response_message_constant_1.default.SOMETHING_WENT_WRONG
        });
    }
};
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to get a single document with members populated
 */
const handleGetDocumentById = async (req, res) => {
    try {
        const { documentId } = req.params;
        const membership = await document_member_model_1.default.findOne({
            documentId,
            userId: req.userId
        });
        if (!membership) {
            return res.status(axios_1.HttpStatusCode.Forbidden).json({
                status: http_message_constant_1.default.FORBIDDEN,
                code: axios_1.HttpStatusCode.Forbidden,
                message: response_message_constant_1.default.DOCUMENT_ACCESS_DENIED
            });
        }
        const document = await document_model_1.default.findOne({ documentId });
        if (!document) {
            return res.status(axios_1.HttpStatusCode.NotFound).json({
                status: http_message_constant_1.default.NOT_FOUND,
                code: axios_1.HttpStatusCode.NotFound,
                message: response_message_constant_1.default.DOCUMENT_NOT_FOUND
            });
        }
        const members = await document_member_model_1.default.find({ documentId });
        return res.status(axios_1.HttpStatusCode.Ok).json({
            status: http_message_constant_1.default.OK,
            code: axios_1.HttpStatusCode.Ok,
            data: {
                ...document.toObject(),
                role: membership.role,
                members
            }
        });
    }
    catch (err) {
        return res.status(axios_1.HttpStatusCode.InternalServerError).json({
            status: http_message_constant_1.default.ERROR,
            code: axios_1.HttpStatusCode.InternalServerError,
            message: response_message_constant_1.default.SOMETHING_WENT_WRONG
        });
    }
};
exports.default = { handleCreateDocument, handleUpdateDocument, handleGetAllDocuments, handleGetDocumentById };
//# sourceMappingURL=document.controller.js.map