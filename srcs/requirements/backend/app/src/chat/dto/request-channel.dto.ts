import { IsNotEmpty, IsString } from 'class-validator';

class ChannelParamDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export default ChannelParamDto;
