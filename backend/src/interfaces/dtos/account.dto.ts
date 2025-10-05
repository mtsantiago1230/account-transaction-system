import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AccountType } from '../../domain/entities/account.entity';

export class CreateAccountDto {
  @IsUUID()
  userId: string;

  @IsString()
  holderName: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString()
  currency: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsNumber()
  @Min(0)
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
  holderName: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
