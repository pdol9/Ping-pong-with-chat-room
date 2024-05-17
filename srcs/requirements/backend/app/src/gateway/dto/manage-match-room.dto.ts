import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class ManageMatchRoomDto {
  @IsNotEmpty()
  @IsString()
  matchId: string;

  @IsNotEmpty()
  @IsEnum(['join', 'leave'])
  action: string;
}

export default ManageMatchRoomDto;
