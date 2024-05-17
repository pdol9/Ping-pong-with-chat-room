import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class JoinChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  password: string;
}

export default JoinChannelDto;
