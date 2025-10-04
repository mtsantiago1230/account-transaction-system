import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, CreateAccountDto, UpdateAccountDto } from '../models/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly apiUrl = 'http://localhost:3000/accounts'; // Temporary hardcoded URL

  constructor(private http: HttpClient) {}

  createAccount(accountData: CreateAccountDto): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, accountData);
  }

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${id}`);
  }

  getAccountsByUserId(userId: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/user/${userId}`);
  }

  getActiveAccountsByUserId(userId: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/user/${userId}/active`);
  }

  getAccountByNumber(accountNumber: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/number/${accountNumber}`);
  }

  updateAccount(id: string, accountData: UpdateAccountDto): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/${id}`, accountData);
  }
}
