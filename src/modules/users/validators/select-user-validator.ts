import { Prisma } from '@prisma/client';

export const selectUserValidator = () => {
  return Prisma.validator<Prisma.UserSelect>()({
    id: true,
    email: true,
    name:true,
    nationalID: true,
    isEmailVerified:true,
    lastLoginAttemptAt:true,
    lockedUntil:true,
    failedLoginAttempts:true,
    lastFailedLoginAt:true,
    createdAt: true,
    updatedAt: true,
    roleId:true,
    role: {
      select: {
        id: true,
        name: true,
      },
    },
    governmentId:true,
     government: {
      select: {
        id: true,
        name: true,
      },
     },
  });
};
