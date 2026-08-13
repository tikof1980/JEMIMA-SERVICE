import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Catalogue central des permissions disponibles dans JEMIMA SERVICE.
// Ajouter une permission = ajouter une ligne (via seed), jamais modifier
// l'architecture existante.
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Code unique, ex: "sales.view", "users.create"
  @Column({ unique: true })
  code: string;

  @Column()
  description: string;

  // Regroupement pour l'affichage (ex: "sales", "users", "ai")
  @Column()
  category: string;
}
