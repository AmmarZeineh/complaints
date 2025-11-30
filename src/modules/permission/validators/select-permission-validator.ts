import { Prisma } from '@prisma/client';

export const selectPermissionValidator = () =>
  Prisma.validator<Prisma.PermissionSelect>()({
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
  });