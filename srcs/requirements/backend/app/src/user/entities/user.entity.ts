import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import Stats from './stats.entity';
import Channel from 'src/chat/entities/channel.entity';
import Timestamps from 'src/utils/timestamps';
import Message from 'src/chat/entities/message.entity';
import Direct from 'src/chat/entities/direct.entity';
import Sanction from 'src/chat/entities/sanction.entity';
import Match from 'src/game/entities/match.entity';
import Friend from './friend.entity';

@Entity()
class User extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column({ default: '' })
  nickname: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ default: '' })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: ['online', 'offline', 'in-game'],
    default: 'offline',
  })
  status: string;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  @Column({ nullable: true })
  session: string;

  @Column({ nullable: true })
  socketId: string;

  @OneToOne(() => Stats, (stats: Stats) => stats.user, {
    cascade: true,
    nullable: true,
  })
  stats: Stats;

  @ManyToMany(() => Friend, (friend: Friend) => friend.users, {
    nullable: true,
  })
  friends: Friend[];

  @ManyToMany(() => User, (user: User) => user.blocked, {
    nullable: true,
  })
  @JoinTable()
  blocked: User[];

  @OneToMany(() => Channel, (channel: Channel) => channel.owner, {
    nullable: true,
  })
  ownChannels: Channel[];

  @ManyToMany(() => Channel, (channel: Channel) => channel.admins, {
    nullable: true,
  })
  admChannels: Channel[];

  @ManyToMany(() => Channel, (channel: Channel) => channel.users, {
    nullable: true,
  })
  usrChannels: Channel[];

  @OneToMany(() => Sanction, (sanction: Sanction) => sanction.user, {
    nullable: true,
  })
  sanctions: Sanction[];

  @ManyToMany(() => Direct, (direct: Direct) => direct.users, {
    nullable: true,
  })
  directs: Direct[];

  @OneToMany(() => Message, (message: Message) => message.author, {
    nullable: true,
  })
  messages: Message[];

  @OneToMany(() => Match, (match: Match) => match.homePlayer, {
    nullable: true,
  })
  homeMatches: Match[];

  @OneToMany(() => Match, (match: Match) => match.foreignPlayer, {
    nullable: true,
  })
  foreignMatches: Match[];
}

export default User;
