import User from 'src/user/entities/user.entity';
import Timestamps from 'src/utils/timestamps';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
class Match extends Timestamps {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (player: User) => player.homeMatches, {
    eager: true,
    cascade: true,
  })
  homePlayer: User;

  @ManyToOne(() => User, (player: User) => player.foreignMatches, {
    eager: true,
    cascade: true,
  })
  foreignPlayer: User;

  @Column({ nullable: true })
  homeScore: number;

  @Column({ nullable: true })
  foreignScore: number;
}

export default Match;
