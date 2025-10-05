import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import {
  TransactionType,
  TransactionStatus,
} from '../../domain/entities/transaction.entity';

export class CreateTransactionDto {
  @IsOptional()
  @IsUUID(4, { message: 'fromAccountId must be a valid UUID' })
  fromAccountId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'toAccountId must be a valid UUID' })
  toAccountId?: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  description: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  description?: string;
}

export class TransactionResponseDto {
  id: string;
  fromAccountId?: string;
  toAccountId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DateRangeDto {
  startDate: Date;
  endDate: Date;
}
