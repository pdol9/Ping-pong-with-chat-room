import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
class Stats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user: User) => user.stats, {})
  @JoinColumn()
  user: User;

  @Column({ default: 0 })
  rank: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;
}

export default Stats;
