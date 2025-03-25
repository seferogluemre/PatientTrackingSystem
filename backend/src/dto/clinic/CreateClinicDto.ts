import { IsString, IsNotEmpty } from "class-validator";

export class CreateClinicDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
}