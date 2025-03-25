import { IsString, IsNotEmpty } from "class-validator";

export class UpdateClinicDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
}