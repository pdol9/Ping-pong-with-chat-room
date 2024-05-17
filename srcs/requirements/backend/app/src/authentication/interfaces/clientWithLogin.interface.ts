import { Socket } from 'socket.io';

interface ClientWithLogin extends Socket {
  login: string;
}

export default ClientWithLogin;
