import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db.js';



export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newOrgId = crypto.randomUUID();
    
    // Create Organization and User simultaneously
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        organization: {
          create: {
            id: newOrgId,
            clerkOrgId: newOrgId,
            name: "My Workspace"
          }
        }
      }
    });

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: user.id, email: user.email, organizationId: user.organizationId } });
  } catch (error) {
    console.error('[Signup Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, user: { id: user.id, email: user.email, organizationId: user.organizationId } });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, organizationId: true }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};