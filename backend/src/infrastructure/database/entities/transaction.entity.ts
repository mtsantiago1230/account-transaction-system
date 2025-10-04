import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { TransactionType, TransactionStatus } from '../../../domain/entities/transaction.entity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fromAccountId: string;

  @Column({ nullable: true })
  toAccountId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ unique: true })
  reference: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('AccountEntity', 'outgoingTransactions', { nullable: true })
  @JoinColumn({ name: 'fromAccountId' })
  fromAccount: any;

  @ManyToOne('AccountEntity', 'incomingTransactions', { nullable: true })
  @JoinColumn({ name: 'toAccountId' })
  toAccount: any;

  @BeforeInsert()
  generateReference() {
    this.reference = `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}