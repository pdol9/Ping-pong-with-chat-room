import User from 'src/user/entities/user.entity';
import Timestamps from 'src/utils/timestamps';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Chat from './chat.entity';

@Entity()
class Direct extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => User, (user: User) => user.directs, {})
  @JoinTable()
  users: [User, User];

  @OneToOne(() => Chat, (chat) => chat.direct, {
    cascade: true,
  })
  @JoinColumn()
  chat: Chat;

  @Column({ default: false })
  hidden: boolean;
}

export default Direct;
