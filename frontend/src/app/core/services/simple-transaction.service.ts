import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SimpleTransactionDto {
  accountId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  description?: string;
}

export interface TransactionResult {
  transactionId: string;
  accountId: string;
  type: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SimpleTransactionService {
  private readonly apiUrl = 'http://localhost:3000/simple-transactions';

  constructor(private http: HttpClient) {}

  createTransaction(transactionData: SimpleTransactionDto): Observable<TransactionResult> {
    return this.http.post<TransactionResult>(this.apiUrl, transactionData);
  }

  getTransactionsByAccount(accountId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${accountId}`);
  }
}