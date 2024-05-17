import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class ManageUserRoomDto {
  @IsNotEmpty()
  @IsString()
  userLogin: string;

  @IsNotEmpty()
  @IsEnum(['join', 'leave'])
  action: string;
}

export default ManageUserRoomDto;
