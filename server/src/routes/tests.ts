import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createTestSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  code: z.string().min(1, 'Test code is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  sampleType: z.string().min(1, 'Sample type is required'),
  containerType: z.string().min(1, 'Container type is required'),
  normalRange: z.string().optional(),
  unit: z.string().optional()
});

const updateTestSchema = createTestSchema.partial();

// Get all tests
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { search, category, active = 'true', page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { code: { contains: search as string } },
        { category: { contains: search as string } }
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (active !== 'all') {
      where.isActive = active === 'true';
    }

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { name: 'asc' }
      }),
      prisma.test.count({ where })
    ]);

    res.json({
      tests,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get test categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.test.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get test by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create test
router.post('/', authenticateToken, requireRoles(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const data = createTestSchema.parse(req.body);

    // Check if test code already exists
    const existingTest = await prisma.test.findUnique({
      where: { code: data.code }
    });

    if (existingTest) {
      return res.status(400).json({ error: 'Test code already exists' });
    }

    const test = await prisma.test.create({
      data
    });

    res.status(201).json(test);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update test
router.put('/:id', authenticateToken, requireRoles(['ADMIN']), async (req, res) => {
  try {
    const data = updateTestSchema.parse(req.body);

    // If updating code, check if it already exists
    if (data.code) {
      const existingTest = await prisma.test.findFirst({
        where: { 
          code: data.code,
          id: { not: req.params.id }
        }
      });

      if (existingTest) {
        return res.status(400).json({ error: 'Test code already exists' });
      }
    }

    const test = await prisma.test.update({
      where: { id: req.params.id },
      data
    });

    res.json(test);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle test active status
router.patch('/:id/toggle', authenticateToken, requireRoles(['ADMIN']), async (req, res) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const updatedTest = await prisma.test.update({
      where: { id: req.params.id },
      data: { isActive: !test.isActive }
    });

    res.json(updatedTest);
  } catch (error) {
    console.error('Toggle test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete test
router.delete('/:id', authenticateToken, requireRoles(['ADMIN']), async (req, res) => {
  try {
    // Check if test is used in any orders
    const orderTest = await prisma.orderTest.findFirst({
      where: { testId: req.params.id }
    });

    if (orderTest) {
      return res.status(400).json({ error: 'Cannot delete test that is used in orders' });
    }

    await prisma.test.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;