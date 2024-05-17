import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      await this.authenticationService.authSession(request, 'mfa');
    } catch (error) {
      // console.log(error.message);
      return false;
    }

    return true;
  }
}
