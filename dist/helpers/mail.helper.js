"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInviteMail = exports.sendOtpMail = void 0;
// Importing env variables
require("dotenv/config");
// Importing packages
const nodemailer_1 = __importDefault(require("nodemailer"));
// Creating transporter
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
});
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to send OTP to the user email
 */
const sendOtpMail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Collab Editor" <${process.env.SMTP_MAIL}>`,
            to: email,
            subject: 'Email Verification OTP',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">Verify your email</h2>
          <p style="color: #555;">Use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; padding: 16px 0;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
        });
        return true;
    }
    catch (err) {
        console.error('Mail send error:', err);
        return false;
    }
};
exports.sendOtpMail = sendOtpMail;
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to send a document invite email with a join link
 */
const sendInviteMail = async (email, inviterName, documentTitle, joinLink) => {
    try {
        await transporter.sendMail({
            from: `"Collab Editor" <${process.env.SMTP_MAIL}>`,
            to: email,
            subject: `You're invited to collaborate on "${documentTitle}"`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #333; margin-bottom: 8px;">You've been invited!</h2>
          <p style="color: #555; line-height: 1.6;">
            <strong>${inviterName}</strong> has invited you to collaborate on the document
            <strong>"${documentTitle}"</strong>.
          </p>
          <p style="color: #555; line-height: 1.6;">Click the button below to join:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${joinLink}" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px;">
              Join Document
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this link in your browser:</p>
          <p style="color: #4f46e5; font-size: 12px; word-break: break-all;">${joinLink}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 11px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `
        });
        return true;
    }
    catch (err) {
        console.error('Invite mail send error:', err);
        return false;
    }
};
exports.sendInviteMail = sendInviteMail;
//# sourceMappingURL=mail.helper.js.map