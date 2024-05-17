import Database from './database.interface';
import Api42 from './api42.interface';
import Jwt from './jwt.interface';
import Mfa from './mfa.interface';

interface Config {
  port: number;
  ws_port: number;
  postgres: {
    database: Database;
  };
  api42: Api42;
  jwt: Jwt;
  mfa: Mfa;
}

export default Config;
