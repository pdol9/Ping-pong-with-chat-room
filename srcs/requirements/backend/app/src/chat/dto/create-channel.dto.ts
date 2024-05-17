import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  password: string;
}

export default CreateChannelDto;
