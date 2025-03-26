
import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateExaminationDto {
    @IsNumber()
    @IsNotEmpty()
    appointment_id!: number;

    @IsString()
    @IsNotEmpty()
    diagnosis!: string;

    @IsString()
    @IsNotEmpty()
    treatment!: string;

    @IsString()
    @IsOptional()
    notes?: string;
}


export class UpdateExaminationDto {
    @IsString()
    @IsOptional()
    diagnosis?: string;

    @IsString()
    @IsOptional()
    treatment?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

