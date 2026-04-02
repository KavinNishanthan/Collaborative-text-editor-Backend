"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const axios_1 = require("axios");
// Importing models
const user_model_1 = __importDefault(require("../models/user.model"));
const activity_log_model_1 = __importDefault(require("../models/activity-log.model"));
const document_member_model_1 = __importDefault(require("../models/document-member.model"));
// Importing constants
const http_message_constant_1 = __importDefault(require("../constants/http-message.constant"));
const response_message_constant_1 = __importDefault(require("../constants/response-message.constant"));
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to get all activity logs for a document
 */
const handleGetActivityLog = async (req, res) => {
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
        const logs = await activity_log_model_1.default
            .find({ documentId })
            .sort({ timestamp: -1 });
        const enriched = await Promise.all(logs.map(async (log) => {
            const user = await user_model_1.default
                .findOne({ userId: log.userId })
                .select('name profilePicture username -_id');
            return { ...log.toObject(), user };
        }));
        return res.status(axios_1.HttpStatusCode.Ok).json({
            status: http_message_constant_1.default.OK,
            code: axios_1.HttpStatusCode.Ok,
            message: response_message_constant_1.default.ACTIVITY_FETCHED,
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
exports.default = {
    handleGetActivityLog
};
//# sourceMappingURL=activity.controller.js.map