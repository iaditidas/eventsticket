import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (user: { id: string; email: string; role: string; name: string }) => {
  const token = jwt.sign(user, env.JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
};

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email address already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userRole = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: userRole,
        },
      });

      const payload = { id: user.id, email: user.email, role: user.role as any, name: user.name };
      const { token } = generateTokens(payload);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { user: payload, token },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const payload = { id: user.id, email: user.email, role: user.role as any, name: user.name };
      const { token } = generateTokens(payload);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: 'Logged in successfully',
        data: { user: payload, token },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    return res.json({ success: true, data: { user: req.user } });
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully' });
  }
}
