import { IsNotEmpty, IsString } from 'class-validator';

class ManageInviteDto {
  @IsNotEmpty()
  @IsString()
  chatId: string;
}

export default ManageInviteDto;
