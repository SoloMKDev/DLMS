import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, requireRoles(['ADMIN', 'PATHOLOGIST']), async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get counts
    const [
      totalPatients,
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      samplePendingOrders,
      sampleProcessingOrders,
      reportProcessingOrders,
      verifiedOrders,
      totalRevenue,
      monthRevenue
    ] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { status: 'SAMPLE_PENDING' } }),
      prisma.order.count({ where: { status: 'SAMPLE_PROCESSING' } }),
      prisma.order.count({ where: { status: 'REPORT_PROCESSING' } }),
      prisma.order.count({ where: { status: 'VERIFIED' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.aggregate({ 
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true } 
      })
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            patientCode: true
          }
        },
        orderTests: {
          include: {
            test: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Get order status distribution for chart
    const statusDistribution = [
      { status: 'Sample Pending', count: samplePendingOrders, color: '#f59e0b' },
      { status: 'Sample Processing', count: sampleProcessingOrders, color: '#3b82f6' },
      { status: 'Report Processing', count: reportProcessingOrders, color: '#8b5cf6' },
      { status: 'Verified', count: verifiedOrders, color: '#10b981' }
    ];

    // Get daily orders for the last 7 days
    const dailyOrders = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        const count = await prisma.order.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        });

        return {
          date: date.toISOString().split('T')[0],
          orders: count
        };
      })
    );

    // Get top tests
    const topTests = await prisma.orderTest.groupBy({
      by: ['testId'],
      _count: {
        testId: true
      },
      orderBy: {
        _count: {
          testId: 'desc'
        }
      },
      take: 5
    });

    const topTestsWithNames = await Promise.all(
      topTests.map(async (item) => {
        const test = await prisma.test.findUnique({
          where: { id: item.testId },
          select: { name: true, code: true }
        });
        return {
          name: test?.name || 'Unknown',
          code: test?.code || 'Unknown',
          count: item._count.testId
        };
      })
    );

    res.json({
      summary: {
        totalPatients,
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        monthRevenue: monthRevenue._sum.totalAmount || 0
      },
      statusDistribution,
      dailyOrders: dailyOrders.reverse(),
      topTests: topTestsWithNames,
      recentOrders
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get revenue analytics
router.get('/revenue', authenticateToken, requireRoles(['ADMIN', 'PATHOLOGIST']), async (req: AuthRequest, res) => {
  try {
    const { period = 'month' } = req.query;
    const today = new Date();
    
    let startDate: Date;
    let groupBy: string;
    
    switch (period) {
      case 'week':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        groupBy = 'month';
        break;
      default: // month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        groupBy = 'day';
    }

    // This is a simplified version - in a real app, you'd want more sophisticated grouping
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'VERIFIED'
      },
      select: {
        createdAt: true,
        totalAmount: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const revenueData = orders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.totalAmount;
      return acc;
    }, {});

    const chartData = Object.entries(revenueData).map(([date, revenue]) => ({
      date,
      revenue
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;