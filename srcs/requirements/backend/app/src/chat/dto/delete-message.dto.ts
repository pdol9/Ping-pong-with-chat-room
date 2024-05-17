import { IsNotEmpty, IsString } from 'class-validator';

class DeleteMessageDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export default DeleteMessageDto;
