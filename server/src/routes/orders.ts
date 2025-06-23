import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createOrderSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  testIds: z.array(z.string()).min(1, 'At least one test is required'),
  referredBy: z.string().optional()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['SAMPLE_PENDING', 'SAMPLE_PROCESSING', 'REPORT_PROCESSING', 'VERIFIED'])
});

// Get all orders
router.get('/', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'PATHOLOGIST', 'RECEPTIONIST']), async (req: AuthRequest, res) => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string } },
        { patient: { 
          OR: [
            { firstName: { contains: search as string } },
            { lastName: { contains: search as string } },
            { patientCode: { contains: search as string } }
          ]
        }}
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              patientCode: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          orderTests: {
            include: {
              test: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  price: true
                }
              }
            }
          },
          creator: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          sampleCollector: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          verifier: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'PATHOLOGIST', 'RECEPTIONIST']), async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
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
        },
        sampleCollector: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        verifier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create order
router.post('/', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'RECEPTIONIST']), async (req: AuthRequest, res) => {
  try {
    const data = createOrderSchema.parse(req.body);

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify tests exist and calculate total
    const tests = await prisma.test.findMany({
      where: { id: { in: data.testIds } }
    });

    if (tests.length !== data.testIds.length) {
      return res.status(400).json({ error: 'One or more tests not found' });
    }

    const totalAmount = tests.reduce((sum, test) => sum + test.price, 0);

    // Generate order number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true }
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.replace('ORD', ''));
      nextNumber = lastNumber + 1;
    }

    const orderNumber = `ORD${nextNumber.toString().padStart(6, '0')}`;

    // Create order with tests
    const order = await prisma.order.create({
      data: {
        orderNumber,
        patientId: data.patientId,
        referredBy: data.referredBy,
        createdBy: req.user!.id,
        totalAmount,
        orderTests: {
          create: data.testIds.map(testId => ({
            testId
          }))
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
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
      }
    });

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
router.patch('/:id/status', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'PATHOLOGIST']), async (req: AuthRequest, res) => {
  try {
    const { status } = updateOrderStatusSchema.parse(req.body);
    const updateData: any = { status };

    // Set additional fields based on status
    if (status === 'SAMPLE_PROCESSING') {
      updateData.sampleCollectedAt = new Date();
      updateData.sampleCollectedBy = req.user!.id;
    } else if (status === 'VERIFIED') {
      updateData.reportReadyAt = new Date();
      updateData.verifiedBy = req.user!.id;
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
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
        },
        sampleCollector: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        verifier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update test results
router.patch('/:id/results', authenticateToken, requireRoles(['ADMIN', 'LAB_TECH', 'PATHOLOGIST']), async (req: AuthRequest, res) => {
  try {
    const { results } = req.body; // Array of { testId, result, notes }

    if (!Array.isArray(results)) {
      return res.status(400).json({ error: 'Results must be an array' });
    }

    // Update test results
    await Promise.all(
      results.map(({ testId, result, notes }) =>
        prisma.orderTest.updateMany({
          where: {
            orderId: req.params.id,
            testId
          },
          data: {
            result,
            notes
          }
        })
      )
    );

    // Get updated order
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        orderTests: {
          include: {
            test: true
          }
        }
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Update test results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete order
router.delete('/:id', authenticateToken, requireRoles(['ADMIN']), async (req, res) => {
  try {
    await prisma.order.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;