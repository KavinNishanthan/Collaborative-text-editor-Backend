// Importing packages
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';

// Importing constants
import httpStatusConstant from '../constants/http-message.constant';
import responseMessageConstant from '../constants/response-message.constant';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This middleware is used to authenticate requests using JWT from HttpOnly cookie
 */

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const tokenMatch = cookieHeader.split('; ').find((c) => c.startsWith('token='));
    const token = tokenMatch ? tokenMatch.split('=')[1] : null;

    if (!token) {
      res.status(HttpStatusCode.Unauthorized).json({
        status: httpStatusConstant.UNAUTHORIZED,
        code: HttpStatusCode.Unauthorized,
        message: responseMessageConstant.TOKEN_MISSING
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      email: string;
    };

    req.userId = decoded.userId;
    req.email = decoded.email;

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(HttpStatusCode.Unauthorized).json({
        status: httpStatusConstant.UNAUTHORIZED,
        code: HttpStatusCode.Unauthorized,
        message: responseMessageConstant.SESSION_EXPIRED
      });
      return;
    }

    res.status(HttpStatusCode.Unauthorized).json({
      status: httpStatusConstant.UNAUTHORIZED,
      code: HttpStatusCode.Unauthorized,
      message: responseMessageConstant.SOMETHING_WENT_WRONG
    });
  }
};

export default authMiddleware;
