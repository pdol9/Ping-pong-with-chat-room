import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import User from './entities/user.entity';
import {
  UserPreview,
  UserPrivateProfile,
  UserPublicProfile,
} from './interfaces/user.interface';
import { AuthGuard } from 'src/authentication/auth.guard';
import UserParamDto from './dto/request-user.dto';
import RequestWithUser from 'src/authentication/interfaces/requestWithLogin.interface';
// import CreateUserDto from './dto/create-user.dto';
import { StatsPreview } from './interfaces/stats.interface';
import { FriendService } from './friend.service';
import { StatsService } from './stats.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly friendService: FriendService,
    private readonly statsService: StatsService,
  ) {}

  // get preview of user's profile
  @UseGuards(AuthGuard)
  @Get(':login/preview')
  async getUserPreview(@Param() { login }: UserParamDto): Promise<UserPreview> {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    return this.userService.getPreview(user);
  }

  @UseGuards(AuthGuard)
  @Get(':login/profile')
  async getUserProfile(
    @Param() { login }: UserParamDto,
    @Req() request: RequestWithUser,
  ): Promise<UserPrivateProfile | UserPublicProfile> {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (request.login !== user.login) {
      return await this.userService.getPublicProfile(request.login, user.login);
    } else if (request.login === user.login) {
      return await this.userService.getPrivateProfile(request.login);
    }
  }

  // stats
  @UseGuards(AuthGuard)
  @Get(':login/stats')
  async getUserStats(@Param() { login }: UserParamDto): Promise<StatsPreview> {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    return await this.statsService.getStats(user.login);
  }

  // // update user data
  // @UseGuards(AuthGuard)
  // @Patch(':login/update')
  // async updateUser(
  //   @Param() { login }: UserParamDto,
  //   @Body() body: UpdateUserDto,
  //   @Req() request: RequestWithUser,
  // ): Promise<UserPrivateProfile> {
  //   try {
  //     this.userService.validateUserAlternation(login, request.user.login);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   const user = await this.userService.update(request.user, body);
  //   return this.userService.getPrivateProfile(user);
  // }

  // @UseGuards(AuthGuard)
  // @Post(':login/upload')
  // @UseInterceptors(FileInterceptor('image', {
  //     fileFilter(req, file, callback) {
  //       if (!file.mimetype.startsWith('image/')) {
  //         return callback(new BadRequestException('upload only allowed for images'), false);
  //       }
  //       callback(null, true);
  //     },
  //   })
  // )
  // async uploadAvatar(
  //   @Param() { login }: UserParamDto,
  //   @UploadedFile() image: Express.Multer.File,
  //   @Req() request: RequestWithUser,
  // ) {
  //   try {
  //     this.userService.validateUserAlternation(login, request.user.login);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   await this.userService.setAvatar(request.user, image.buffer);
  //   const dataURL = this.userService.imageToDataURL(image.buffer);
  //   return dataURL;
  //   // response.type('png').send(user.avatar);
  // }

  @UseGuards(AuthGuard)
  @Get(':login/avatar')
  async getAvatar(@Param() { login }: UserParamDto) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (!user.avatar) {
      throw new NotFoundException('no avatar found');
    }
    return user.avatar;
  }

  ///////////////////////////////////////////////////////////////

  @UseGuards(AuthGuard)
  @Get(':login/friends')
  async getFriends(
    @Param() { login }: UserParamDto,
    @Req() request: RequestWithUser,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (request.login !== user.login) {
      return await this.friendService.getPublicFriends(user.login);
    } else if (request.login === user.login) {
      return await this.friendService.getPrivateFriends(user.login);
    }
  }

  // @UseGuards(AuthGuard)
  // @Post(':login/block')
  // async block(@Param() { login }: UserParamDto, @Req() request: RequestWithUser) {
  //   let user: User;
  //   try {
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     this.friendService.validateBlocking(request.user, user);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   await this.friendService.blockUser(request.user, user);
  // }

  // @UseGuards(AuthGuard)
  // @Post(':login/unblock')
  // async unblock(@Param() { login }: UserParamDto, @Req() request: RequestWithUser) {
  //   let user: User;
  //   try {
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     this.friendService.validateUnblocking(request.user, user);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   await this.friendService.unblockUser(request.user, user);
  // }

  @UseGuards(AuthGuard)
  @Get('rank')
  async getRank() {
    const users = await this.userService.getLadder();
    return this.userService.getRankPreview(users);
  }

  // @UseGuards(AuthGuard)
  // @Post('friend/:login/new')
  // async createFriendship(@Param() { login }: UserParamDto, @Req() request: RequestWithUser) {
  //   let user: User;
  //   let friend: Friend;
  //   try {
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     await this.friendService.validateCreateRequest(request.user, user);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   friend = await this.friendService.createFriendship(request.user, user);
  //   return this.friendService.getFriendPreview(friend);
  // }

  // @UseGuards(AuthGuard)
  // @Post('friend/:login/confirm')
  // async confirmFriendship(@Param() { login }: UserParamDto, @Req() request: RequestWithUser) {
  //   let user: User;
  //   let friend: Friend;
  //   try {
  //     user = await this.userService.secureFindByLogin(login);
  //     friend = await this.friendService.secureFindFriendship(request.user, user);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     this.friendService.validateConfirmRequest(request.user, friend);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   friend = await this.friendService.confirmFriendship(friend);
  //   return this.friendService.getFriendPreview(friend);
  // }

  // @UseGuards(AuthGuard)
  // @Delete('friend/:login/remove')
  // async removeFriendship(@Param() { login }: UserParamDto, @Req() request: RequestWithUser) {
  //   let user: User;
  //   let friend: Friend;
  //   try {
  //     user = await this.userService.secureFindByLogin(login);
  //     friend = await this.friendService.secureFindFriendship(request.user, user);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   friend = await this.friendService.removeFriendship(friend);
  //   return this.friendService.getFriendPreview(friend);
  // }

  //   // find (pending) requests
  //   @Get('friends/rec/:login')
  //   async findRecReq(@Param('login') userLogin: string) {
  //     try {
  //       const pendingFriends = await this.userService.findRecReq(userLogin);
  //       return pendingFriends;
  //     } catch (error) {
  //       console.error('An error occurred while getting pending friends:', error);
  //       return {
  //         statusCode: 500,
  //         message: 'An error occurred while getting pending friends',
  //         error: error.message,
  //       };
  //     }
  //   }

  //   @Get('friends/sent/:login')
  //   async findSentReq(@Param('login') userLogin: string) {
  //     try {
  //       const pendingFriends = await this.userService.findSentReq(userLogin);
  //       return pendingFriends;
  //     } catch (error) {
  //       console.error('An error occurred while getting pending friends:', error);
  //       return {
  //         statusCode: 500,
  //         message: 'An error occurred while getting pending friends',
  //         error: error.message,
  //       };
  //     }
  //   }

  //   // confirm friend request
  //   @Post('friends/:login/:friendId')
  //   async confirmReq(@Param('login') userLogin: string, @Param('friendId') friendLogin: string
  //   ) {
  //     try {
  //       await this.userService.confirm(userLogin, friendLogin);
  //       return { message: 'Friend request confirmed successfully' };
  //     } catch (error) {
  //       console.error('An error occurred while confirming friend:', error);
  //       return {
  //         statusCode: 500,
  //         message: 'An error occurred while confirming friend',
  //         error: error.message,
  //       };
  //     }
  //   }

  //   // send / create friend (entry) request
  //   @Post(':login/friends/:friendId')
  //   async createFriendReq(@Param('login') userLogin: string, @Param('friendId') friendLogin: string) {
  //     try {
  //       const result = await this.userService.createFriend(userLogin, friendLogin);
  //       return result;
  //     } catch (error) {
  //       console.error('An error occurred while creating the friend:', error);
  //       return {
  //         statusCode: 500,
  //         message: 'An error occurred while creating the friend',
  //         error: error.message,
  //       };
  //     }
  //   }

  //   // remove friendship / request
  //   @Delete('rm/:login/:friendId')
  //   async removeFriend(@Param('login') userLogin: string, @Param('friendId') friendLogin: string) {
  //     try {
  //       await this.userService.removeFriendshipx(userLogin, friendLogin);
  //     } catch (error) {
  //       console.error('An error occurred while removing friendship:', error);
  //       return {
  //         statusCode: 500,
  //         message: 'An error occurred while removing friendship',
  //         error: error.message,
  //       };
  //     }
  //   }

  // ///////////////////////////////////////////////////////////////

  // TESTING
  // @Get()
  // async getAllUsers(): Promise<User[]> {
  //   const users = await this.userService.getAllUsers();
  //   return users;
  // }

  // @Post()
  // async create(@Body() userData: CreateUserDto) {
  //   const user = await this.userService.create(userData);
  //   return user;
  // }
}

// // {
// //   "login": "john123",
// //   "email": "john@example.com",
// //   "nickname": "JohnDoe",
// //   "firstname": "John",
// //   "lastname": "Doe",
// //   "bio": "Hello, I'm John Doe.",
// //   "avatar": "https://example.com/avatar.jpg",
// //   "status": "online",
// //   "twoFactorAuthEnabled": false
// // }
