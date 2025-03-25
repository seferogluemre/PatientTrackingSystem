
import { IsString, IsOptional } from "class-validator";

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
