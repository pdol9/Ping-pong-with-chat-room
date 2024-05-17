import { IsNotEmpty, IsString } from 'class-validator';

class ChatParamDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export default ChatParamDto;
