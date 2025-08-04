import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.PANEL_EMAIL &&
    password === process.env.PANEL_PASSWORD
  ) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: '2h',
    });

    return res.json({ token });
  }

  return res.status(401).json({ message: 'Credenciales incorrectas' });
});

export default router;
