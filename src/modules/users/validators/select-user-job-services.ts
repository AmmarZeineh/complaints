import { selectUserValidator } from "./select-user-validator";
import { Prisma } from '@prisma/client';

export const selectUserJobsWithServices = (userId: number) => ({
  ...selectUserValidator(), 
  userJob: {
    where: { isActive: true },
    include: {
      job: {
        include: {
          localizations: true,
          services: {
            where: { userId }, 
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              depositAmount: true,
              durationInMin: true,
              jobId: true, 
            },
          },
        },
      },
    },
  },
});
