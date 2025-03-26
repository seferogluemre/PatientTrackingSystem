import { IsString, IsNotEmpty, IsNumber, IsDateString, IsDate, IsOptional } from "class-validator";
import { AppointmentStatus } from "src/types";


export class CreateAppointmentDto {
    @IsNumber()
    @IsNotEmpty()
    patient_id!: number;

    @IsNumber()
    @IsNotEmpty()
    doctor_id!: number;

    @IsDateString()
    @IsNotEmpty()
    date!: Date;

    @IsString()
    @IsNotEmpty()
    status!: AppointmentStatus;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsNumber()
    @IsNotEmpty()
    secretary_id!: number;
}

export class UpdateAppointmentDto {
    @IsDate()
    @IsOptional()
    date?: Date;

    @IsString()
    @IsOptional()
    status?: AppointmentStatus;
}