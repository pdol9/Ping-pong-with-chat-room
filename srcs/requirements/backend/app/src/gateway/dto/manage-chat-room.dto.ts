import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class ManageChatRoomDto {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsNotEmpty()
  @IsEnum(['join', 'leave'])
  action: string;
}

export default ManageChatRoomDto;
