import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UserController } from '../../interfaces/controllers/user.controller';
import {
  CreateUserUseCase,
  GetUserUseCase,
  GetUserByEmailUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  GetAllUsersUseCase,
} from '../../application/use-cases/account/user.use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserRepository,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    CreateUserUseCase,
    GetUserUseCase,
    GetUserByEmailUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetAllUsersUseCase,
  ],
  exports: [UserRepository, 'IUserRepository'],
})
export class UserModule {}
