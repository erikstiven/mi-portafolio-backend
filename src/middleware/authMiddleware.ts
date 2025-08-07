import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('Authorization header:', req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log('No token provided!');
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).usuario = decoded;
    console.log('Token OK:', decoded);
    next();
  } catch (error) {
    console.log('JWT VERIFY ERROR:', error);
    return res.status(403).json({ message: 'Token inválido' });
  }
};

