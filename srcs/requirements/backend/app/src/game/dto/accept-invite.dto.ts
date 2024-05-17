import { IsNotEmpty, IsString } from 'class-validator';

class AcceptInviteDto {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsNotEmpty()
  @IsString()
  userLogin: string;
}

export default AcceptInviteDto;
