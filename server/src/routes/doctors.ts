import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createDoctorSchema = z.object({
  name: z.string().min(1, 'Doctor name is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal(''))
});

const updateDoctorSchema = createDoctorSchema.partial();

// Get all doctors
router.get('/', authenticateToken, requireRoles(['ADMIN', 'RECEPTIONIST']), async (req: AuthRequest, res) => {
  try {
    const { search, active = 'true', page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { specialization: { contains: search as string } },
        { phone: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    if (active !== 'all') {
      where.isActive = active === 'true';
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { name: 'asc' }
      }),
      prisma.doctor.count({ where })
    ]);

    res.json({
      doctors,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor by ID
router.get('/:id', authenticateToken, requireRoles(['ADMIN', 'RECEPTIONIST']), async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create doctor
router.post('/', authenticateToken, requireRoles(['ADMIN', 'RECEPTIONIST']), async (req: AuthRequest, res) => {
  try {
    const data = createDoctorSchema.parse(req.body);

    const doctor = await prisma.doctor.create({
      data: {
        ...data,
        email: data.email || null
      }
    });

    res.status(201).json(doctor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update doctor
router.put('/:id', authenticateToken, requireRoles(['ADMIN', 'RECEPTIONIST']), async (req, res) => {
  try {
    const data = updateDoctorSchema.parse(req.body);

    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: {
        ...data,
        email: data.email || null
      }
    });

    res.json(doctor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle doctor active status
router.patch('/:id/toggle', authenticateToken, requireRoles(['ADMIN']), async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: { isActive: !doctor.isActive }
    });

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Toggle doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete doctor
router.delete('/:id', authenticateToken, requireRoles(['ADMIN']), async (req, res) => {
  try {
    await prisma.doctor.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;