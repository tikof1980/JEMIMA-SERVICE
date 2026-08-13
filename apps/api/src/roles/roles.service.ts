import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, SystemRole } from './role.entity';
import { RolePermission } from './role-permission.entity';
import { Permission } from '../permissions/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionsRepo: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionsRepo: Repository<Permission>,
  ) {}

  findById(id: string): Promise<Role | null> {
    return this.rolesRepo.findOne({ where: { id } });
  }

  findByName(name: SystemRole | string): Promise<Role | null> {
    return this.rolesRepo.findOne({ where: { name, isSystem: true } });
  }

  async getPermissionCodes(roleId: string): Promise<string[]> {
    const rolePermissions = await this.rolePermissionsRepo.find({
      where: { role: { id: roleId } },
      relations: ['permission'],
    });
    return rolePermissions.map((rp) => rp.permission.code);
  }

  async grantPermission(roleId: string, permissionCode: string): Promise<boolean> {
    const permission = await this.permissionsRepo.findOne({ where: { code: permissionCode } });
    if (!permission) return false;
    const exists = await this.rolePermissionsRepo.findOne({
      where: { role: { id: roleId }, permission: { id: permission.id } },
    });
    if (exists) return false;
    const rp = this.rolePermissionsRepo.create({ role: { id: roleId } as Role, permission });
    await this.rolePermissionsRepo.save(rp);
    return true;
  }

  async revokePermission(roleId: string, permissionCode: string): Promise<boolean> {
    const permission = await this.permissionsRepo.findOne({ where: { code: permissionCode } });
    if (!permission) return false;
    const existing = await this.rolePermissionsRepo.findOne({
      where: { role: { id: roleId }, permission: { id: permission.id } },
    });
    if (!existing) return false;
    await this.rolePermissionsRepo.delete(existing.id);
    return true;
  }

  createCustomRole(companyId: string, name: string): Promise<Role> {
    const role = this.rolesRepo.create({ companyId, name, isSystem: false });
    return this.rolesRepo.save(role);
  }
}
