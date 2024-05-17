import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class UpdatePaddelPositionDto {
  @IsNotEmpty()
  @IsString()
  matchId: string;

  @IsNotEmpty()
  @IsNumber()
  y: number;
}

export default UpdatePaddelPositionDto;
