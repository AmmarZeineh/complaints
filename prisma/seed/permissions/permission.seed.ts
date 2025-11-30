import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import PERMISSIONS from './permissions.json';

export async function upsertPermissions(prisma: PrismaService) {
  await prisma.$transaction(
    PERMISSIONS.map((permission) =>
      prisma.permission.upsert({
        where: { id: permission.id },
        create: { id: permission.id, name: permission.name },
        update: {},
      }),
    ),
  );
}
