import { IsString, IsNotEmpty, IsDate, IsOptional } from "class-validator";
import { UserRole } from "src/types";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    first_name!: string;

    @IsString()
    @IsNotEmpty()
    last_name!: string;

    @IsString()
    @IsNotEmpty()
    tc_no!: string;

    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsNotEmpty()
    role!: UserRole;

    @IsDate()
    @IsNotEmpty()
    birthDate!: Date;

    @IsString()
    @IsOptional()
    specialty?: string;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    first_name?: string;

    @IsString()
    @IsOptional()
    last_name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsDate()
    @IsOptional()
    birthDate?: Date;
}