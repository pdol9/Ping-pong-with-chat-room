import Timestamps from 'src/utils/timestamps';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from 'src/user/entities/user.entity';
import Chat from './chat.entity';

@Entity()
class Message extends Timestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (author: User) => author.messages, {
    cascade: true,
  })
  author: User;

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages, {
    cascade: true,
  })
  chat: Chat;

  @Column()
  content: string;
}

export default Message;
