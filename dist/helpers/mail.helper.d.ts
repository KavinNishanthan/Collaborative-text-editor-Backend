import 'dotenv/config';
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to send OTP to the user email
 */
declare const sendOtpMail: (email: string, otp: string) => Promise<boolean>;
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This function is used to send a document invite email with a join link
 */
declare const sendInviteMail: (email: string, inviterName: string, documentTitle: string, joinLink: string) => Promise<boolean>;
export { sendOtpMail, sendInviteMail };
//# sourceMappingURL=mail.helper.d.ts.map