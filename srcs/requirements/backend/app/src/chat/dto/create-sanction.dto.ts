import { IsEnum, IsISO8601, IsNotEmpty, IsString } from 'class-validator';

class CreateSanctionDto {
  @IsNotEmpty()
  @IsString()
  channelName: string;

  @IsNotEmpty()
  @IsString()
  userLogin: string;

  @IsNotEmpty()
  @IsEnum(['mute', 'ban'])
  type: string;

  @IsNotEmpty()
  @IsISO8601({ strict: true })
  // YYYY-MM-DD hh:mm:ss.sss±hh:mm
  timeout: Date;
}

export default CreateSanctionDto;
