import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import User from './user.entity';

@Entity()
class Friend {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToMany(() => User, (user: User) => user.friends, {})
  @JoinTable()
  users: [User, User];

  @Column()
  receiverLogin: string;

  @Column({ default: true })
  pending: boolean;
}

export default Friend;
