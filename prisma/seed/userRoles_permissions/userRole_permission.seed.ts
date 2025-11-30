import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import ROLE_PERMISSIONS from './userRoles_permissions.json';

export async function upsertRolePermissions(prisma: PrismaService) {
  const operations: any[] = [];

  for (const rp of ROLE_PERMISSIONS) {
    for (const permissionId of rp.permissions) {
      // نتحقق أولاً من وجود الرابط
      const existing = await prisma.userRolePermission.findFirst({
        where: {
          userRoleId: rp.roleId,
          permissionId,
        },
      });

      if (existing) {
        // إذا كان موجود وممسوح، نعيد تفعيله
        if (existing.deletedAt !== null) {
          operations.push(
            prisma.userRolePermission.update({
              where: { id: existing.id },
              data: { deletedAt: null },
            })
          );
        }
        // إذا موجود وغير ممسوح، نتجاهل
      } else {
        // غير موجود → نضيفه
        operations.push(
          prisma.userRolePermission.create({
            data: {
              userRoleId: rp.roleId,
              permissionId,
            },
          })
        );
      }
    }
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }
}
