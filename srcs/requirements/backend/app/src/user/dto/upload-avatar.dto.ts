import { IsNotEmpty, IsString } from 'class-validator';

class UploadAvatarDto {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  data: ArrayBuffer;
}

export default UploadAvatarDto;
