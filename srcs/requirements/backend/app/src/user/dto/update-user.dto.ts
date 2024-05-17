import { IsOptional, IsString } from 'class-validator';

class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  bio: string;
}

export default UpdateUserDto;
