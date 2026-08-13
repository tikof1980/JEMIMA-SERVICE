/**
 * Script de seed initial de JEMIMA SERVICE.
 *
 * Crée :
 *  - le catalogue des permissions
 *  - les rôles système (super_admin, owner, admin, manager, employee)
 *    avec leurs permissions par défaut
 *  - le compte Super Admin initial, à partir des variables d'environnement
 *    SUPER_ADMIN_EMAIL et SUPER_ADMIN_PASSWORD (JAMAIS en dur dans le code)
 *
 * Usage : ts-node src/scripts/seed.ts
 */
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Permission } from '../permissions/permission.entity';
import { Role, SystemRole } from '../roles/role.entity';
import { RolePermission } from '../roles/role-permission.entity';
import { User } from '../users/user.entity';

dotenv.config();

const PERMISSION_CATALOG: { code: string; category: string; description: string }[] = [
  ['company.view', 'company', "Consulter l'entreprise"],
  ['company.update', 'company', "Modifier l'entreprise"],
  ['users.view', 'users', 'Consulter les utilisateurs'],
  ['users.create', 'users', 'Créer un utilisateur'],
  ['users.update', 'users', 'Modifier un utilisateur'],
  ['users.delete', 'users', 'Supprimer un utilisateur'],
  ['customers.view', 'customers', 'Consulter les clients'],
  ['customers.create', 'customers', 'Créer un client'],
  ['customers.update', 'customers', 'Modifier un client'],
  ['customers.delete', 'customers', 'Supprimer un client'],
  ['sales.view', 'sales', 'Consulter les ventes'],
  ['sales.create', 'sales', 'Créer une vente'],
  ['sales.update', 'sales', 'Modifier une vente'],
  ['sales.delete', 'sales', 'Supprimer une vente'],
  ['finance.view', 'finance', 'Consulter les finances'],
  ['finance.create', 'finance', 'Créer une entrée financière'],
  ['finance.update', 'finance', 'Modifier une entrée financière'],
  ['stock.view', 'stock', 'Consulter le stock'],
  ['stock.create', 'stock', 'Créer un article de stock'],
  ['stock.update', 'stock', 'Modifier le stock'],
  ['appointments.view', 'appointments', 'Consulter les rendez-vous'],
  ['appointments.create', 'appointments', 'Créer un rendez-vous'],
  ['appointments.update', 'appointments', 'Modifier un rendez-vous'],
  ['appointments.delete', 'appointments', 'Supprimer un rendez-vous'],
  ['reservations.view', 'reservations', 'Consulter les réservations'],
  ['reservations.create', 'reservations', 'Créer une réservation'],
  ['reservations.update', 'reservations', 'Modifier une réservation'],
  ['reservations.delete', 'reservations', 'Supprimer une réservation'],
  ['reports.view', 'reports', 'Consulter les rapports'],
  ['qr.view', 'qr', 'Consulter les QR codes'],
  ['qr.create', 'qr', 'Créer un QR code'],
  ['qr.update', 'qr', 'Modifier un QR code'],
  ['qr.delete', 'qr', 'Supprimer un QR code'],
  ['automation.view', 'automation', 'Consulter les automatisations'],
  ['automation.create', 'automation', 'Créer une automatisation'],
  ['automation.update', 'automation', 'Modifier une automatisation'],
  ['automation.delete', 'automation', 'Supprimer une automatisation'],
  ['ai.view', 'ai', "Consulter l'activité de l'IA"],
  ['ai.execute', 'ai', "Autoriser l'IA à exécuter une action"],
  ['settings.view', 'settings', 'Consulter les paramètres'],
  ['settings.update', 'settings', 'Modifier les paramètres'],
].map(([code, category, description]) => ({ code, category, description }));

const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  [SystemRole.OWNER]: PERMISSION_CATALOG.map((p) => p.code), // accès total à son entreprise
  [SystemRole.ADMIN]: PERMISSION_CATALOG.filter((p) => p.category !== 'settings').map(
    (p) => p.code,
  ),
  [SystemRole.MANAGER]: PERMISSION_CATALOG.filter((p) =>
    ['sales', 'customers', 'stock', 'appointments', 'reservations', 'reports'].includes(
      p.category,
    ),
  ).map((p) => p.code),
  [SystemRole.EMPLOYEE]: PERMISSION_CATALOG.filter(
    (p) =>
      ['sales', 'customers', 'appointments', 'reservations'].includes(p.category) &&
      p.code.endsWith('.view') === false, // employé : view + create, pas delete/update sensibles
  )
    .map((p) => p.code)
    .concat(PERMISSION_CATALOG.filter((p) => p.code.endsWith('.view')).map((p) => p.code)),
  [SystemRole.SUPER_ADMIN]: [], // le Super Admin contourne les permissions (isSuperAdmin=true)
};

async function seed() {
  const dataSource = await AppDataSource.initialize();

  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);
  const userRepo = dataSource.getRepository(User);

  console.log('Seed : catalogue de permissions...');
  const savedPermissions: Record<string, Permission> = {};
  for (const perm of PERMISSION_CATALOG) {
    let existing = await permissionRepo.findOne({ where: { code: perm.code } });
    if (!existing) {
      existing = await permissionRepo.save(permissionRepo.create(perm));
    }
    savedPermissions[perm.code] = existing;
  }

  console.log('Seed : rôles système...');
  for (const roleName of Object.values(SystemRole)) {
    let role = await roleRepo.findOne({ where: { name: roleName, isSystem: true } });
    if (!role) {
      role = await roleRepo.save(roleRepo.create({ name: roleName, isSystem: true }));
    }

    const codesToGrant = ROLE_DEFAULT_PERMISSIONS[roleName] || [];
    for (const code of codesToGrant) {
      const exists = await rolePermissionRepo.findOne({
        where: { role: { id: role.id }, permission: { id: savedPermissions[code].id } },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({ role, permission: savedPermissions[code] }),
        );
      }
    }
  }

  console.log('Seed : compte Super Admin...');
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    console.warn(
      'SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD absents des variables d\'environnement — ' +
        'compte Super Admin non créé. Définissez-les puis relancez le seed.',
    );
  } else {
    const existing = await userRepo.findOne({ where: { email: superAdminEmail } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(superAdminPassword, 12);
      await userRepo.save(
        userRepo.create({
          email: superAdminEmail,
          passwordHash,
          fullName: 'Super Admin',
          isSuperAdmin: true,
          isActive: true,
        }),
      );
      console.log(`Super Admin créé : ${superAdminEmail}`);
    } else {
      console.log('Super Admin déjà existant, aucune action.');
    }
  }

  await dataSource.destroy();
  console.log('Seed terminé.');
}

seed().catch((err) => {
  console.error('Erreur durant le seed :', err);
  process.exit(1);
});
