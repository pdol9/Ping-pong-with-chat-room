import { Injectable } from '@nestjs/common';
import Match from './entities/match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { GameSession } from './interfaces/game.interface';
import { GameResults } from './interfaces/match.interface';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly userService: UserService,
  ) {}

  async createMatch(matchId: string, session: GameSession) {
    const match = this.matchRepository.create({
      id: matchId,
      homePlayer: await this.userService.findByLogin(session.player.home),
      foreignPlayer: await this.userService.findByLogin(session.player.foreign),
      homeScore: session.score.home,
      foreignScore: session.score.foreign,
    });
    await this.matchRepository.save(match);
    return match;
  }

  async getMatchHistory(login: string) {
    const user = await this.userService.findByLogin(login, {
      homeMatches: true,
      foreignMatches: true,
    });
    const matches = [...user.homeMatches, ...user.foreignMatches];
    const matchHistory = await Promise.all(
      matches.map(async (match: Match) => await this.getGameResults(match.id)),
    );
    return matchHistory;
  }

  async getGameResults(id: string) {
    const match = await this.findById(id, {
      homePlayer: true,
      foreignPlayer: true,
    });
    const gameResults: GameResults = {
      id: id,
      homePlayer: this.userService.getPreview(match.homePlayer),
      foreignPlayer: this.userService.getPreview(match.foreignPlayer),
      homeScore: match.homeScore,
      foreignScore: match.foreignScore,
      created_at: match.created_at,
    };
    return gameResults;
  }

  async secureFindById(id: string) {
    const match = await this.findById(id);
    if (!match) {
      throw new Error('invalid id');
    }
    return match;
  }

  async findById(id: string, relations?: any) {
    let params: any;
    if (relations) {
      params = {
        where: {
          id: id,
        },
        relations: relations,
      };
    } else {
      params = {
        where: {
          id: id,
        },
      };
    }
    const match = await this.matchRepository.findOne(params);
    return match;
  }
}
