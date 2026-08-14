import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { MembershipsModule } from '../memberships/memberships.module';
import { RolesModule } from '../roles/roles.module';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';

// CompanyContextGuard et PermissionsGuard sont appliqués via @UseGuards()
// dans CompaniesController ; Nest résout leurs dépendances (MembershipsService,
// RolesService) grâce aux modules importés ci-dessous, qui les exportent.
@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    MembershipsModule,
    RolesModule,
    AuditModule,
    UsersModule,
  ],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
