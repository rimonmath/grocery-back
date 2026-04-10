import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const userCount = await this.userRepository.count();

    if (userCount === 0) {
      console.log('🌱 No users found. Seeding initial data...');

      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = this.userRepository.create({
        email: 'admin@grocery.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      });

      const user = this.userRepository.create({
        email: 'user@grocery.com',
        password: hashedPassword,
        role: UserRole.USER,
      });

      await this.userRepository.save([admin, user]);

      console.log('✅ Seeding complete.');
      console.log('Admin: admin@grocery.com / admin123');
      console.log('User: user@grocery.com / admin123');
    } else {
      console.log('🚀 Database already has users. Skipping seed.');
    }
  }
}
