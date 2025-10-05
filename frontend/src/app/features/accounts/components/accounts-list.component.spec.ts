import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AccountsListComponent } from './accounts-list.component';
import { AccountService } from '../../../core/services/account.service';
import { Account, AccountType } from '../../../core/models/account.model';

// Mock components
@Component({
  selector: 'app-loading-spinner',
  template: '<div data-testid="loading-spinner">Loading...</div>',
  standalone: false,
})
class MockLoadingSpinnerComponent {
  @Input() size?: string;
  @Input() message?: string;
}

@Component({
  selector: 'app-card',
  template: '<div data-testid="card"><ng-content></ng-content></div>',
  standalone: false,
})
class MockCardComponent {}

@Component({
  selector: 'app-button',
  template: '<button data-testid="button" (click)="onClick.emit()"><ng-content></ng-content></button>',
  standalone: false,
})
class MockButtonComponent {
  @Input() variant?: string;
  onClick = { emit: jest.fn() };
}

// Mock pipe
@Pipe({ name: 'currency', standalone: false })
class MockCurrencyPipe implements PipeTransform {
  transform(value: number, currency: string): string {
    return `${currency} ${value.toFixed(2)}`;
  }
}

describe('AccountsListComponent', () => {
  let component: AccountsListComponent;
  let fixture: ComponentFixture<AccountsListComponent>;
  let mockAccountService: jest.Mocked<AccountService>;
  let mockRouter: jest.Mocked<Router>;

  // Sample test data
  const mockAccounts: Account[] = [
    {
      id: '1',
      userId: 'user1',
      holderName: 'John Doe',
      accountNumber: 'ACC001',
      accountType: 'SAVINGS' as AccountType,
      balance: 1000.50,
      currency: 'USD',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: '2',
      userId: 'user1',
      holderName: 'Jane Smith',
      accountNumber: 'ACC002',
      accountType: 'SAVINGS' as AccountType,
      balance: 2500.75,
      currency: 'EUR',
      isActive: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    }
  ];

  beforeEach(async () => {
    // Create mock services
    mockAccountService = {
      getAllAccounts: jest.fn(),
    } as any;
    
    mockRouter = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [AccountsListComponent],
      declarations: [
        MockLoadingSpinnerComponent,
        MockCardComponent,
        MockButtonComponent,
        MockCurrencyPipe
      ],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Creation', () => {
    it('should create the component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with loading state true', () => {
      expect(component.loading).toBe(true);
    });

    it('should call loadAccounts on ngOnInit', () => {
      const loadAccountsSpy = jest.spyOn(component, 'loadAccounts');
      
      component.ngOnInit();
      
      expect(loadAccountsSpy).toHaveBeenCalled();
    });
  });

  describe('Loading Accounts', () => {
    it('should call AccountService.getAllAccounts when loadAccounts is called', () => {
      mockAccountService.getAllAccounts.mockReturnValue(of(mockAccounts));
      
      component.loadAccounts();
      
      expect(mockAccountService.getAllAccounts).toHaveBeenCalled();
    });

    it('should set accounts$ observable from service response', () => {
      const mockObservable = of(mockAccounts);
      mockAccountService.getAllAccounts.mockReturnValue(mockObservable);
      
      component.loadAccounts();
      
      expect(component.accounts$).toBe(mockObservable);
    });

    it('should set loading to true when loadAccounts is called', () => {
      mockAccountService.getAllAccounts.mockReturnValue(of(mockAccounts));
      component.loading = false; // Set to false first
      
      component.loadAccounts();
      
      expect(component.loading).toBe(true);
    });

    it('should verify accounts observable has data', (done) => {
      mockAccountService.getAllAccounts.mockReturnValue(of(mockAccounts));
      component.loadAccounts();
      
      component.accounts$.subscribe(accounts => {
        expect(accounts.length).toBe(2);
        expect(accounts[0].accountNumber).toBe('ACC001');
        done();
      });
    });
  });

  describe('Loading State Handling', () => {
    beforeEach(() => {
      mockAccountService.getAllAccounts.mockReturnValue(of(mockAccounts));
    });

    it('should display loading spinner when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const loadingSpinner = fixture.debugElement.query(By.css('app-loading-spinner'));
      
      expect(loadingSpinner).toBeTruthy();
    });

    it('should hide accounts content when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const accountsContent = fixture.debugElement.query(By.css('.bg-white.shadow'));
      
      expect(accountsContent).toBeFalsy();
    });

    it('should show accounts content when loading is false and has data', async () => {
      component.loadAccounts();
      component.loading = false;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const accountsContent = fixture.debugElement.query(By.css('.bg-white.shadow'));

      expect(accountsContent).toBeTruthy();
    });

    it('should set loading to false after timeout', (done) => {
      jest.useFakeTimers();
      
      component.loadAccounts();
      
      // Fast-forward time
      jest.advanceTimersByTime(600);
      
      expect(component.loading).toBe(false);
      
      jest.useRealTimers();
      done();
    });
  });

  describe('Navigation Functions', () => {
    it('should navigate to create account page when createAccount is called', () => {
      component.createAccount();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/accounts/create']);
    });

    it('should navigate to account detail page when viewAccountDetail is called', () => {
      const accountId = 'test-account-id';
      
      component.viewAccountDetail(accountId);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/accounts', accountId]);
    });
  });
});