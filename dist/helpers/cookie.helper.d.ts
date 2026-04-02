import 'dotenv/config';
import { Response } from 'express';
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to generate a JWT token and set it as an HttpOnly cookie
 */
declare const setAuthCookie: (res: Response, userId: string, email: string) => void;
export { setAuthCookie };
//# sourceMappingURL=cookie.helper.d.ts.map