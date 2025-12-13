import { Prisma } from '@prisma/client';

export const selectRoleValidator = () =>
  Prisma.validator<Prisma.UserRoleSelect>()({
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  });

export const selectRoleWithPermissionsValidator = () =>
  Prisma.validator<Prisma.UserRoleSelect>()({
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    rolePermissions: {
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        permissionId: true,
        deletedAt: true,
        permission: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    _count: {
      select: {
        users: true,
      },
    },
  });