import { IsString, IsOptional } from "class-validator";

export class UpdateExaminationDto {
    @IsString()
    @IsOptional()
    notes?: string;
}