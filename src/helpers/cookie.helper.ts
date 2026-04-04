// Importing env variables
import 'dotenv/config';

// Importing packages
import jwt from 'jsonwebtoken';
import { Response } from 'express';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to generate a JWT token and set it as an HttpOnly cookie
 */

const setAuthCookie = (res: Response, userId: string, email: string): void => {
  const token = jwt.sign({ userId, email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export { setAuthCookie };