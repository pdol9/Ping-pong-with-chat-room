import { IsNotEmpty, IsString } from 'class-validator';

class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export default CreateMessageDto;
