import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './invitation.entity';
import { InvitationsService } from './invitations.service';
import { UsersModule } from '../users/users.module';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation]), UsersModule, MembershipsModule],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
