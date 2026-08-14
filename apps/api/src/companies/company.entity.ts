import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CompanySector {
  TRAVEL_AGENCY = 'travel_agency',
  CLOTHING_BOUTIQUE = 'clothing_boutique',
  HAIR_SALON = 'hair_salon',
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  COMMERCE = 'commerce',
  SERVICE = 'service',
  CUSTOM = 'custom', // Entreprise personnalisable, secteur libre
}

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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

  // Identifiant lisible/URL-friendly, dérivé du nom, unique
  @Index()
  @Column({ unique: true })
  slug: string;

  @Column({ type: 'enum', enum: CompanySector })
  sector: CompanySector;

  // Libellé libre du secteur pour les entreprises personnalisables
  @Column({ nullable: true })
  customSectorLabel: string;

  @Index()
  @Column({ type: 'enum', enum: CompanyStatus, default: CompanyStatus.ACTIVE })
  status: CompanyStatus;

  @Column({ nullable: true, type: 'text' })
  description: string;

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

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ default: 'Africa/Abidjan' })
  timezone: string;

  // Horaires d'ouverture libres, ex: { "mon": "08:00-18:00", ... }
  @Column({ type: 'jsonb', default: {} })
  businessHours: Record<string, string>;

  // Modules activés pour cette entreprise (ex: ["bookings", "stock", "qr"])
  @Column({ type: 'jsonb', default: [] })
  enabledModules: string[];

  // Champs personnalisés libres pour les futures évolutions
  @Column({ type: 'jsonb', default: {} })
  customFields: Record<string, unknown>;

  // Paramètres libres (alertes vocales, horaires silencieux, etc.)
  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
