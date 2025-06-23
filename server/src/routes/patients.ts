import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  referredBy: z.string().optional()
});

const updatePatientSchema = createPatientSchema.partial();

// Get all patients
router.get('/', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'RECEPTIONIST']), async (req: AuthRequest, res) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = search ? {
      OR: [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { patientCode: { contains: search as string } },
        { phone: { contains: search as string } },
        { email: { contains: search as string } }
      ]
    } : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      }),
      prisma.patient.count({ where })
    ]);

    res.json({
      patients,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get patient by ID
router.get('/:id', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'RECEPTIONIST']), async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        orders: {
          include: {
            orderTests: {
              include: {
                test: true
              }
            },
            creator: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create patient
router.post('/', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'RECEPTIONIST']), async (req: AuthRequest, res) => {
  try {
    const data = createPatientSchema.parse(req.body);

    // Generate patient code
    const lastPatient = await prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { patientCode: true }
    });

    let nextNumber = 1;
    if (lastPatient) {
      const lastNumber = parseInt(lastPatient.patientCode.replace('P', ''));
      nextNumber = lastNumber + 1;
    }

    const patientCode = `P${nextNumber.toString().padStart(4, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        ...data,
        patientCode,
        email: data.email || null
      }
    });

    res.status(201).json(patient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update patient
router.put('/:id', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'RECEPTIONIST']), async (req, res) => {
  try {
    const data = updatePatientSchema.parse(req.body);

    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: {
        ...data,
        email: data.email || null
      }
    });

    res.json(patient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete patient
router.delete('/:id', authenticateToken, requireRoles(['ADMIN']), async (req, res) => {
  try {
    await prisma.patient.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;