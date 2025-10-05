// login.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsDefined } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
  };
}
