import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { RolePermission } from './role-permission.entity';

// Rôles système fixes + support de rôles personnalisés (isSystem = false)
export enum SystemRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // null companyId = rôle système global (super_admin, owner, admin, manager, employee)
  // rempli = rôle personnalisé créé par une entreprise (CUSTOM ROLE)
  @Column({ nullable: true })
  companyId: string;

  @Column()
  name: string; // ex: "owner" ou un nom personnalisé "responsable_stock"

  @Column({ default: true })
  isSystem: boolean;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];

  @CreateDateColumn()
  createdAt: Date;
}
