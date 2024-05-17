import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class ManageChannelRoomDto {
  @IsNotEmpty()
  @IsString()
  channelName: string;

  @IsNotEmpty()
  @IsEnum(['join', 'leave'])
  action: string;
}

export default ManageChannelRoomDto;
