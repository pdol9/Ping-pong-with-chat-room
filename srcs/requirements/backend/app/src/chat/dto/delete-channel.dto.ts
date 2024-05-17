import { IsNotEmpty, IsString } from 'class-validator';

class DeleteChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export default DeleteChannelDto;
