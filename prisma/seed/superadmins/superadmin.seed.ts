import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import * as bcrypt from 'bcrypt';
import SUPERADMIN_DATA from './superadmin.json';

export async function upsertSuperAdmin(prisma: PrismaService) {
  const { name, email, password } = SUPERADMIN_DATA;

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      password: hashedPassword,
      roleId: 1,
    },
  });
}
