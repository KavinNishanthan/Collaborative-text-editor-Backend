import { Request, Response, NextFunction } from 'express';
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description This middleware is used to authenticate requests using JWT from HttpOnly cookie
 */
declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export default authMiddleware;
//# sourceMappingURL=auth.middleware.d.ts.map