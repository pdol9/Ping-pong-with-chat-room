import { IsNotEmpty, IsString } from 'class-validator';

class NameLoginParamDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  login: string;
}

export default NameLoginParamDto;
