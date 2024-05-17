import { IsNotEmpty, IsString } from 'class-validator';

class StartGameDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export default StartGameDto;
