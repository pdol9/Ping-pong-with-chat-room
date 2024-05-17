import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MatchService } from './match.service';
import UserParamDto from 'src/user/dto/request-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/authentication/auth.guard';
import { MatchHistory } from './interfaces/match.interface';
import Match from './entities/match.entity';
import MatchParamDto from './dto/request-id.dto';

@Controller('match')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('history/:login')
  async getMatchHistory(@Param() { login }: UserParamDto) {
    try {
      await this.userService.secureFindByLogin(login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    const matchHistory: MatchHistory = {
      matches: await this.matchService.getMatchHistory(login),
    };
    return matchHistory;
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getMatch(@Param() { id }: MatchParamDto) {
    let match: Match;
    try {
      match = await this.matchService.secureFindById(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    return match;
  }
}
