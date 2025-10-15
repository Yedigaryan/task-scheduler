import {IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, MinLength} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    assigneeId!: number;

    @IsDateString()
    startAt!: string;

    @IsDateString()
    endAt!: string;

    @IsOptional()
    @IsEnum(['pending', 'in_progress', 'completed'] as const)
    status?: 'pending' | 'in_progress' | 'completed';
}


