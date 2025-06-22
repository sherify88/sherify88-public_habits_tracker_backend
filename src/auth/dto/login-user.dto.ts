import { IsEmail, IsNotEmpty } from "@nestjs/class-validator";

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}

