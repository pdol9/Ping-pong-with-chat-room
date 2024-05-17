import { IsNotEmpty, IsString } from 'class-validator';

class MatchParamDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export default MatchParamDto;
