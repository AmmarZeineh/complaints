import { Prisma } from '@prisma/client';

export const selectUserValidator = () => {
  return Prisma.validator<Prisma.UserSelect>()({
    id: true,
    email: true,
    name:true,
    nationalID: true,
    isEmailVerified:true,
    createdAt: true,
    updatedAt: true,
    roleId:true,
    role: {
      select: {
        id: true,
        name: true,
      },
    },
  });
};
