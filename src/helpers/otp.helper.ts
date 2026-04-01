/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to generate a 6 digit OTP
 */

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export { generateOTP };