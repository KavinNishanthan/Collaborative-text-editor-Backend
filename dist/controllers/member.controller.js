"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const joi_1 = __importDefault(require("joi"));
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = require("axios");
// Importing helpers
const uuid_helper_1 = require("../helpers/uuid.helper");
const mail_helper_1 = require("../helpers/mail.helper");
// Importing models
const user_model_1 = __importDefault(require("../models/user.model"));
const document_model_1 = __importDefault(require("../models/document.model"));
const activity_log_model_1 = __importDefault(require("../models/activity-log.model"));
const document_member_model_1 = __importDefault(require("../models/document-member.model"));
// Importing constants
const http_message_constant_1 = __importDefault(require("../constants/http-message.constant"));
const response_message_constant_1 = __importDefault(require("../constants/response-message.constant"));
/**
 * @createdBy Kavin Nishanthan P D
 * @updatedAt 2026-04-02
 * @description This function is used to invite a member to a document by email.
 *              It checks if the email is registered, generates a share link,
 *              and sends an invite email. The member is added only when they click the link.
 */
const handleInviteMember = async (req, res) => {
    try {
        const { documentId } = req.params;
        const invite = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            role: joi_1.default.string().valid('editor', 'viewer').required()
        });
        const { error, value } = invite.validate(req.body);
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
                message: response_message_constant_1.default.ONLY_OWNER_CAN_INVITE
            });
        }
        const targetUser = await user_model_1.default.findOne({ email: value.email });
        if (!targetUser) {
            return res.status(axios_1.HttpStatusCode.NotFound).json({
                status: http_message_constant_1.default.NOT_FOUND,
                code: axios_1.HttpStatusCode.NotFound,
                message: response_message_constant_1.default.USER_NOT_REGISTERED
            });
        }
        const existingMember = await document_member_model_1.default.findOne({
            documentId,
            userId: targetUser.userId
        });
        if (existingMember) {
            return res.status(axios_1.HttpStatusCode.Conflict).json({
                status: http_message_constant_1.default.CONFLICT,
                code: axios_1.HttpStatusCode.Conflict,
                message: response_message_constant_1.default.MEMBER_ALREADY_EXISTS
            });
        }
        const shareToken = crypto_1.default.randomBytes(32).toString('hex');
        await document_model_1.default.findOneAndUpdate({ documentId }, { shareToken });
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const joinLink = `${clientUrl}/join/${shareToken}`;
        const inviter = await user_model_1.default.findOne({ userId: req.userId });
        const document = await document_model_1.default.findOne({ documentId });
        const inviterName = inviter?.name || 'Someone';
        const documentTitle = document?.title || 'Untitled Document';
        const mailSent = await (0, mail_helper_1.sendInviteMail)(value.email, inviterName, documentTitle, joinLink);
        if (!mailSent) {
            return res.status(axios_1.HttpStatusCode.InternalServerError).json({
                status: http_message_constant_1.default.ERROR,
                code: axios_1.HttpStatusCode.InternalServerError,
                message: response_message_constant_1.default.INVITE_MAIL_FAILED
            });
        }
        await activity_log_model_1.default.create({
            logId: (0, uuid_helper_1.generateUUID)(),
            documentId,
            userId: req.userId,
            action: 'invited',
            metadata: targetUser.userId,
            timestamp: new Date()
        });
        return res.status(axios_1.HttpStatusCode.Ok).json({
            status: http_message_constant_1.default.OK,
            code: axios_1.HttpStatusCode.Ok,
            message: response_message_constant_1.default.INVITE_SENT
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
exports.default = { handleInviteMember };
//# sourceMappingURL=member.controller.js.map