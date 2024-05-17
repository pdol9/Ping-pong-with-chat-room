import { Request } from 'express';

interface RequestWithLogin extends Request {
  login: string;
}

export default RequestWithLogin;
