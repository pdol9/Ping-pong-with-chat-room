import { IsNotEmpty, IsString } from 'class-validator';

class AdministrateChannelDto {
  @IsNotEmpty()
  @IsString()
  channelName: string;

  @IsNotEmpty()
  @IsString()
  userLogin: string;
}

export default AdministrateChannelDto;
