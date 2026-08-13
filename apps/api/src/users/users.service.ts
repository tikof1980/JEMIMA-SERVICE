import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  findByResetTokenHash(tokenHash: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { passwordResetTokenHash: tokenHash } });
  }

  create(data: DeepPartial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async update(id: string, data: DeepPartial<User>): Promise<User | null> {
    await this.usersRepo.save({ id, ...data });
    return this.findById(id);
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.usersRepo.update(id, { isActive });
  }
}
