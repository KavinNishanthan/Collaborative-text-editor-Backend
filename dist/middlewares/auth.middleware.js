"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = require("axios");
// Importing constants
const http_message_constant_1 = __importDefault(require("../constants/http-message.constant"));
const response_message_constant_1 = __importDefault(require("../constants/response-message.constant"));
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This middleware is used to authenticate requests using JWT from HttpOnly cookie
 */
const authMiddleware = (req, res, next) => {
    try {
        const cookieHeader = req.headers.cookie || '';
        const tokenMatch = cookieHeader.split('; ').find((c) => c.startsWith('token='));
        const token = tokenMatch ? tokenMatch.split('=')[1] : null;
        if (!token) {
            res.status(axios_1.HttpStatusCode.Unauthorized).json({
                status: http_message_constant_1.default.UNAUTHORIZED,
                code: axios_1.HttpStatusCode.Unauthorized,
                message: response_message_constant_1.default.TOKEN_MISSING
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.email = decoded.email;
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.status(axios_1.HttpStatusCode.Unauthorized).json({
                status: http_message_constant_1.default.UNAUTHORIZED,
                code: axios_1.HttpStatusCode.Unauthorized,
                message: response_message_constant_1.default.SESSION_EXPIRED
            });
            return;
        }
        res.status(axios_1.HttpStatusCode.Unauthorized).json({
            status: http_message_constant_1.default.UNAUTHORIZED,
            code: axios_1.HttpStatusCode.Unauthorized,
            message: response_message_constant_1.default.SOMETHING_WENT_WRONG
        });
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map