import { IsString, IsDate, IsOptional } from "class-validator";
import { AppointmentStatus } from "src/models/appointment_model";


export class UpdateAppointmentDto {
    @IsDate()
    @IsOptional()
    date?: Date;

    @IsString()
    @IsOptional()
    status?: AppointmentStatus;
}