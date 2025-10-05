import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('App', () => {
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    // Create mock AuthService
    mockAuthService = {
      isAuthenticated: jest.fn(() => false),
      login: jest.fn(),
      logout: jest.fn(),
      currentUser: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Account Transaction System');
  });
});
