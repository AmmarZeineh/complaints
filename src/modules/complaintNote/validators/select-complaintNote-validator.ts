import { Prisma } from '@prisma/client';

export const selectComplaintNoteValidator = () =>
  Prisma.validator<Prisma.ComplaintNoteSelect>()({
    id: true,
    complaintId: true,
    userId: true,
    content: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        name: true,
      },
    },
    complaint: {
      select: {
        id: true,
        description: true,
      },
    },
  });