import { Prisma } from '@prisma/client';
import { selectUserValidator } from '../../users/validators/select-user-validator';

export const selectAuthValidator = () => {
  const base = selectUserValidator();

  // إزالة الحقول التي سيتم استبدالها
  delete base.role;
  delete base.isEmailVerified;

  return Prisma.validator<Prisma.UserSelect>()({
    ...base,
    password: true,
    isEmailVerified: true,
    role: {
      select: {
        name: true, 
      },
    },
  });
};
