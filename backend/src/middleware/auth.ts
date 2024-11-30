import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token missing' });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
      if (err) {
        res.status(403).json({ message: 'Invalid access token' });
        return;
      }

      if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
        (req as any).user = decoded;
        next();
      } else {
        res.status(403).json({ message: 'Invalid token payload' });
        return;
      }
    }
  );
};
