import { IsString, IsNotEmpty, IsDate, IsOptional } from "class-validator";
import { UserRole } from "src/models/user_model";



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