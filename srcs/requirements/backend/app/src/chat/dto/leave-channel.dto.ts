import { IsNotEmpty, IsString } from 'class-validator';

class LeaveChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export default LeaveChannelDto;
