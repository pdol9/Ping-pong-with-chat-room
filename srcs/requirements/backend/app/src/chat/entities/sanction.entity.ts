import Timestamps from 'src/utils/timestamps';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Channel from './channel.entity';
import User from 'src/user/entities/user.entity';

@Entity()
class Sanction extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['mute', 'ban'],
  })
  type: string;

  @Column()
  timeout: Date;

  @ManyToOne(() => Channel, (channel: Channel) => channel.sanctions, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @ManyToOne(() => User, (user: User) => user.sanctions, {
    onDelete: 'CASCADE',
  })
  user: User;
}

export default Sanction;
