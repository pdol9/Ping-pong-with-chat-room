import User from 'src/user/entities/user.entity';
import Timestamps from 'src/utils/timestamps';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Sanction from './sanction.entity';
import Chat from './chat.entity';

@Entity()
class Channel extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['public', 'private', 'protected'],
  })
  type: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  password: string;

  @ManyToOne(() => User, (owner: User) => owner.ownChannels, {})
  owner: User;

  @ManyToMany(() => User, (admin: User) => admin.admChannels, {
    nullable: true,
  })
  @JoinTable()
  admins: User[];

  @ManyToMany(() => User, (user: User) => user.usrChannels, {
    nullable: true,
  })
  @JoinTable()
  users: User[];

  @OneToMany(() => Sanction, (sanction: Sanction) => sanction.channel, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  sanctions: Sanction[];

  @OneToOne(() => Chat, (chat) => chat.channel, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  chat: Chat;
}

export default Channel;
