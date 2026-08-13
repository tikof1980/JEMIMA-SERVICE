import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CompanySector {
  TRAVEL_AGENCY = 'travel_agency',
  CLOTHING_BOUTIQUE = 'clothing_boutique',
  HAIR_SALON = 'hair_salon',
  CUSTOM = 'custom', // Entreprise personnalisable, secteur libre
}

export enum CompanyStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ARCHIVED = 'archived',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Code unique utilisé pour résoudre le tenant à l'authentification
  @Column({ unique: true })
  tenantCode: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CompanySector })
  sector: CompanySector;

  // Libellé libre du secteur pour les entreprises personnalisables
  @Column({ nullable: true })
  customSectorLabel: string;

  @Column({ type: 'enum', enum: CompanyStatus, default: CompanyStatus.ACTIVE })
  status: CompanyStatus;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  // Modules activés pour cette entreprise (ex: ["bookings", "stock", "qr"])
  @Column({ type: 'jsonb', default: [] })
  enabledModules: string[];

  // Paramètres libres (alertes vocales, horaires silencieux, etc.)
  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
