import { IsNotEmpty, IsString } from 'class-validator';

class MfaDto {
  @IsNotEmpty()
  @IsString()
  mfa: string;
}

export default MfaDto;
