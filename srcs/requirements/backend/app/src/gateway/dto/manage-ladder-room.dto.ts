import { IsEnum, IsNotEmpty } from 'class-validator';

class ManageLadderRoomDto {
  @IsNotEmpty()
  @IsEnum(['join', 'leave'])
  action: string;
}

export default ManageLadderRoomDto;
