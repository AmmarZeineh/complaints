import { Prisma } from '@prisma/client';

export const selectComplaintValidator = () =>
  Prisma.validator<Prisma.ComplaintSelect>()({
    id: true,
    userId: true,
    governmentId: true,
    type: true,
    description: true,
    Location: true,
    documents: true,
    status: true, 
    images: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        name: true,
      },
    },
    government: {
      select: {
        id: true,
        name: true,
      },
    },
    // ✅ إضافة التفاعلات
    interactions: {
      select: {
        id: true,
        complaintId: true,
        senderId: true,
        message: true,
        type: true, 
        images: true,
        documents: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc', // اختياري: ترتيب حسب الأحدث
      },
    },
  });