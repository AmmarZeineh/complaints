import { Prisma } from '@prisma/client';

export const selectUserRolePermissionValidator = () =>
  Prisma.validator<Prisma.UserRolePermissionSelect>()({
    id: true,
    userRoleId: true,
    permissionId: true,
    createdAt: true,
    updatedAt: true,
    userRole: {
      select: {
        id: true,
        name: true,
      },
    },
    permission: {
      select: {
        id: true,
        name: true,
      },
    },
  });