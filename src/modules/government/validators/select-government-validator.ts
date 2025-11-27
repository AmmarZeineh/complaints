import { Prisma } from '@prisma/client';

export const selectGovernmentValidator = () =>
  Prisma.validator<Prisma.GovernmentSelect>()({
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
  });
