import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class UpdateChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  password: string;
}

export default UpdateChannelDto;
