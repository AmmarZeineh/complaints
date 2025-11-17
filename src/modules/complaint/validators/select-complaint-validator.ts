import { Prisma } from '@prisma/client';

export const selectComplaintValidator = () =>
  Prisma.validator<Prisma.ComplaintSelect>()({
    id: true,
    userId: true,
    governmentId: true,
    type: true,
    description: true,
    documents: true,
    createdAt: true,
    updatedAt: true,
  });
