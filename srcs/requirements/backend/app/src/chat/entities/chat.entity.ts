import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Message from './message.entity';
import Channel from './channel.entity';
import Direct from './direct.entity';

@Entity()
class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Channel, (channel) => channel.chat, {
    nullable: true,
  })
  channel: Channel;

  @OneToOne(() => Direct, (direct) => direct.chat, {
    nullable: true,
  })
  direct: Direct;

  @OneToMany(() => Message, (message: Message) => message.chat, {
    nullable: true,
  })
  messages: Message[];
}

export default Chat;
