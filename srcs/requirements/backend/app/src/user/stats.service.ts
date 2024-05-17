import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stats from './entities/stats.entity';
import { Repository } from 'typeorm';
import User from './entities/user.entity';
import { StatsPreview } from './interfaces/stats.interface';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Stats)
    private readonly statsRepository: Repository<Stats>,
  ) {}

  async getStats(login: string) {
    const stats = await this.statsRepository.findOne({
      where: {
        user: {
          login: login,
        },
      },
      relations: {
        user: true,
      },
    });
    const statsPreview: StatsPreview = {
      rank: stats.rank,
      xp: stats.xp,
      wins: stats.wins,
      losses: stats.losses,
    };
    return statsPreview;
  }

  async createStats(user: User) {
    const stats = this.statsRepository.create({
      user: user,
    });
    await this.statsRepository.save(stats);
    return stats;
  }

  async saveStats(stats: Stats) {
    return await this.statsRepository.save(stats);
  }
}
