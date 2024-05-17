import { IsNotEmpty, IsString } from 'class-validator';

class ManageUserDto {
  @IsNotEmpty()
  @IsString()
  login: string;
}

export default ManageUserDto;
