import { IsString, IsEnum, IsOptional, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { AccountType } from '../../domain/entities/account.entity';

export class CreateAccountDto {
  @IsUUID()
  userId: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString()
  currency: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  initialBalance?: number;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @IsOptional()
  isActive?: boolean;
}

export class AccountResponseDto {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}