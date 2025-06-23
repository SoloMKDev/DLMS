import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@plms.com',
      password: adminPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator'
    }
  });

  // Create other users
  const users = [
    {
      username: 'labtech1',
      email: 'labtech1@plms.com',
      password: await bcrypt.hash('labtech123', 10),
      role: 'LAB_TECH',
      firstName: 'John',
      lastName: 'Smith'
    },
    {
      username: 'pathologist1',
      email: 'pathologist1@plms.com',
      password: await bcrypt.hash('path123', 10),
      role: 'PATHOLOGIST',
      firstName: 'Dr. Sarah',
      lastName: 'Johnson'
    },
    {
      username: 'receptionist1',
      email: 'receptionist1@plms.com',
      password: await bcrypt.hash('recep123', 10),
      role: 'RECEPTIONIST',
      firstName: 'Mary',
      lastName: 'Wilson'
    }
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: userData
    });
  }

  // Create doctors
  const doctors = [
    {
      name: 'Dr. Michael Brown',
      specialization: 'Cardiology',
      phone: '+1234567890',
      email: 'michael.brown@hospital.com'
    },
    {
      name: 'Dr. Emily Davis',
      specialization: 'Endocrinology',
      phone: '+1234567891',
      email: 'emily.davis@hospital.com'
    },
    {
      name: 'Dr. Robert Wilson',
      specialization: 'General Medicine',
      phone: '+1234567892',
      email: 'robert.wilson@hospital.com'
    },
    {
      name: 'Dr. Lisa Anderson',
      specialization: 'Nephrology',
      phone: '+1234567893',
      email: 'lisa.anderson@hospital.com'
    }
  ];

  for (const doctorData of doctors) {
    const existingDoctor = await prisma.doctor.findFirst({
      where: { phone: doctorData.phone }
    });
    
    if (!existingDoctor) {
      await prisma.doctor.create({
        data: doctorData
      });
    }
  }

  // Create tests
  const tests = [
    {
      name: 'Complete Blood Count',
      code: 'CBC',
      category: 'Hematology',
      price: 25.00,
      sampleType: 'Blood',
      containerType: 'EDTA Tube',
      normalRange: 'WBC: 4.5-11.0 x10³/µL, RBC: 4.5-5.5 x10⁶/µL',
      unit: 'x10³/µL'
    },
    {
      name: 'Fasting Blood Sugar',
      code: 'FBS',
      category: 'Biochemistry',
      price: 15.00,
      sampleType: 'Blood',
      containerType: 'Fluoride Tube',
      normalRange: '70-100 mg/dL',
      unit: 'mg/dL'
    },
    {
      name: 'Lipid Profile',
      code: 'LIPID',
      category: 'Biochemistry',
      price: 35.00,
      sampleType: 'Blood',
      containerType: 'Plain Tube',
      normalRange: 'Total Cholesterol: <200 mg/dL',
      unit: 'mg/dL'
    },
    {
      name: 'Liver Function Test',
      code: 'LFT',
      category: 'Biochemistry',
      price: 40.00,
      sampleType: 'Blood',
      containerType: 'Plain Tube',
      normalRange: 'ALT: 7-56 U/L, AST: 10-40 U/L',
      unit: 'U/L'
    },
    {
      name: 'Kidney Function Test',
      code: 'KFT',
      category: 'Biochemistry',
      price: 30.00,
      sampleType: 'Blood',
      containerType: 'Plain Tube',
      normalRange: 'Creatinine: 0.6-1.2 mg/dL',
      unit: 'mg/dL'
    },
    {
      name: 'Thyroid Function Test',
      code: 'TFT',
      category: 'Endocrinology',
      price: 50.00,
      sampleType: 'Blood',
      containerType: 'Plain Tube',
      normalRange: 'TSH: 0.4-4.0 mIU/L',
      unit: 'mIU/L'
    },
    {
      name: 'Urine Routine',
      code: 'URINE',
      category: 'Clinical Pathology',
      price: 20.00,
      sampleType: 'Urine',
      containerType: 'Urine Container',
      normalRange: 'Protein: Negative, Sugar: Negative',
      unit: 'Qualitative'
    },
    {
      name: 'HbA1c',
      code: 'HBA1C',
      category: 'Biochemistry',
      price: 45.00,
      sampleType: 'Blood',
      containerType: 'EDTA Tube',
      normalRange: '<5.7%',
      unit: '%'
    }
  ];

  for (const testData of tests) {
    await prisma.test.upsert({
      where: { code: testData.code },
      update: {},
      create: testData
    });
  }

  // Create sample patients
  const patients = [
    {
      patientCode: 'P0001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-06-15'),
      phone: '+1234567890',
      email: 'john.doe@email.com',
      address: '123 Main St, City, State 12345',
      referredBy: 'Dr. Michael Brown'
    },
    {
      patientCode: 'P0002',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1990-03-22'),
      phone: '+1234567891',
      email: 'jane.smith@email.com',
      address: '456 Oak Ave, City, State 12345',
      referredBy: 'Dr. Emily Davis'
    },
    {
      patientCode: 'P0003',
      firstName: 'Michael',
      lastName: 'Johnson',
      dateOfBirth: new Date('1978-11-08'),
      phone: '+1234567892',
      address: '789 Pine St, City, State 12345',
      referredBy: 'Dr. Robert Wilson'
    },
    {
      patientCode: 'P0004',
      firstName: 'Sarah',
      lastName: 'Williams',
      dateOfBirth: new Date('1995-07-12'),
      phone: '+1234567893',
      email: 'sarah.williams@email.com',
      address: '321 Elm St, City, State 12345',
      referredBy: 'Dr. Lisa Anderson'
    },
    {
      patientCode: 'P0005',
      firstName: 'David',
      lastName: 'Brown',
      dateOfBirth: new Date('1982-01-30'),
      phone: '+1234567894',
      email: 'david.brown@email.com',
      address: '654 Maple Ave, City, State 12345',
      referredBy: 'Dr. Michael Brown'
    }
  ];

  for (const patientData of patients) {
    await prisma.patient.upsert({
      where: { patientCode: patientData.patientCode },
      update: {},
      create: patientData
    });
  }

  // Create sample orders
  const allPatients = await prisma.patient.findMany();
  const allTests = await prisma.test.findMany();
  const labTech = await prisma.user.findFirst({ where: { role: 'LAB_TECH' } });

  if (allPatients.length > 0 && allTests.length > 0 && labTech) {
    const orders = [
      {
        orderNumber: 'ORD000001',
        patientId: allPatients[0].id,
        referredBy: 'Dr. Michael Brown',
        status: 'SAMPLE_PENDING' as const,
        createdBy: labTech.id,
        testIds: [allTests[0].id, allTests[1].id], // CBC + FBS
        totalAmount: allTests[0].price + allTests[1].price
      },
      {
        orderNumber: 'ORD000002',
        patientId: allPatients[1].id,
        referredBy: 'Dr. Emily Davis',
        status: 'SAMPLE_PENDING' as const,
        createdBy: labTech.id,
        testIds: [allTests[2].id, allTests[5].id], // Lipid + TFT
        totalAmount: allTests[2].price + allTests[5].price
      },
      {
        orderNumber: 'ORD000003',
        patientId: allPatients[2].id,
        referredBy: 'Dr. Robert Wilson',
        status: 'SAMPLE_PROCESSING' as const,
        createdBy: labTech.id,
        testIds: [allTests[3].id, allTests[4].id], // LFT + KFT
        totalAmount: allTests[3].price + allTests[4].price
      },
      {
        orderNumber: 'ORD000004',
        patientId: allPatients[3].id,
        referredBy: 'Dr. Lisa Anderson',
        status: 'SAMPLE_PENDING' as const,
        createdBy: labTech.id,
        testIds: [allTests[6].id], // Urine Routine
        totalAmount: allTests[6].price
      },
      {
        orderNumber: 'ORD000005',
        patientId: allPatients[4].id,
        referredBy: 'Dr. Michael Brown',
        status: 'REPORT_PROCESSING' as const,
        createdBy: labTech.id,
        testIds: [allTests[7].id], // HbA1c
        totalAmount: allTests[7].price
      },
      {
        orderNumber: 'ORD000006',
        patientId: allPatients[0].id,
        referredBy: 'Dr. Michael Brown',
        status: 'VERIFIED' as const,
        createdBy: labTech.id,
        testIds: [allTests[6].id], // Urine Routine
        totalAmount: allTests[6].price
      }
    ];

    for (const orderData of orders) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: orderData.orderNumber }
      });

      if (!existingOrder) {
        await prisma.order.create({
          data: {
            orderNumber: orderData.orderNumber,
            patientId: orderData.patientId,
            referredBy: orderData.referredBy,
            status: orderData.status,
            createdBy: orderData.createdBy,
            totalAmount: orderData.totalAmount,
            sampleCollectedAt: orderData.status !== 'PENDING' ? new Date() : null,
            sampleCollectedBy: orderData.status !== 'PENDING' ? labTech.id : null,
            orderTests: {
              create: orderData.testIds.map(testId => ({
                testId,
                result: orderData.status === 'IN_PROCESS' ? 'Normal' : null,
                notes: orderData.status === 'IN_PROCESS' ? 'Within normal limits' : null
              }))
            }
          }
        });
      }
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin / admin123');
  console.log('👤 Lab Tech: labtech1 / labtech123');
  console.log('👤 Pathologist: pathologist1 / path123');
  console.log('👤 Receptionist: receptionist1 / recep123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });