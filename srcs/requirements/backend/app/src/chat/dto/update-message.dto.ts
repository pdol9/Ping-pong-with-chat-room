import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class UpdateMessageDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  content: string;
}

export default UpdateMessageDto;
