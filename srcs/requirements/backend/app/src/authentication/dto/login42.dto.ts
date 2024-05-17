import { IsNotEmpty, IsString } from 'class-validator';

class Login42Dto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export default Login42Dto;
