import {
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateSimpleTransactionDto {
  @IsUUID()
  accountId: string;

  @IsEnum(['deposit', 'withdraw'])
  type: 'deposit' | 'withdraw';

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class TransactionResultDto {
  transactionId: string;
  accountId: string;
  type: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  createdAt: Date;
}
