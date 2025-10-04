import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Transaction,
  CreateTransactionDto,
  TransactionDateRangeQuery,
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly apiUrl = 'http://localhost:3000/transactions'; // Temporary hardcoded URL

  constructor(private http: HttpClient) {}

  createTransaction(transactionData: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transactionData);
  }

  processTransaction(id: string): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}/process`, {});
  }

  cancelTransaction(id: string): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getPendingTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/pending`);
  }

  getTransactionsByDateRange(query: TransactionDateRangeQuery): Observable<Transaction[]> {
    const params = new HttpParams().set('startDate', query.startDate).set('endDate', query.endDate);

    return this.http.get<Transaction[]>(`${this.apiUrl}/date-range`, { params });
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  getTransactionsByAccountId(accountId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/account/${accountId}`);
  }

  getTransactionByReference(reference: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/reference/${reference}`);
  }
}
