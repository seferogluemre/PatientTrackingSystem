import { IsString, IsNotEmpty, IsNumber, IsDateString } from "class-validator";
import { AppointmentStatus } from "src/models/appointment_model";


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