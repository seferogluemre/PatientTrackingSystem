import { IsString, IsNotEmpty } from "class-validator";

export class CreateClinicDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
}
export class UpdateClinicDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
}