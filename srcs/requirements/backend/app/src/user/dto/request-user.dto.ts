import { IsNotEmpty, IsString } from 'class-validator';

class UserParamDto {
  @IsNotEmpty()
  @IsString()
  login: string;
}

export default UserParamDto;
