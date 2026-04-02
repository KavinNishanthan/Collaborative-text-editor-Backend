"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
// Importing env variables
require("dotenv/config");
// Importing packages
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to generate a JWT token and set it as an HttpOnly cookie
 */
const setAuthCookie = (res, userId, email) => {
    const token = jsonwebtoken_1.default.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};
exports.setAuthCookie = setAuthCookie;
//# sourceMappingURL=cookie.helper.js.map