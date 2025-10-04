import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AccountType } from '../../../domain/entities/account.entity';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  holderName: string;

  @Column({ unique: true })
  accountNumber: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.SAVINGS,
  })
  accountType: AccountType;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('UserEntity', 'accounts')
  @JoinColumn({ name: 'userId' })
  user: any;

  @OneToMany('TransactionEntity', 'fromAccount')
  outgoingTransactions: any[];

  @OneToMany('TransactionEntity', 'toAccount')
  incomingTransactions: any[];
}
