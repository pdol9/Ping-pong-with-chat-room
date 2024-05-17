import { Injectable } from '@nestjs/common';
import { Player } from './interfaces/game.interface';

@Injectable()
export class MatchmakingService {
  private queue: string[] = [];
  private queueLock: boolean = false;
  private inviteList: string[] = [];
  private inviteListLock: boolean = false;

  joinQueue(login: string) {
    this.lockQueueAccess();
    if (!this.isInQueue(login) && !this.isInInviteList(login)) {
      this.queue.push(login);
      // console.log('joinedQueue');
    } else {
      this.unlockQueueAccess();
      throw new Error('already waiting for a match');
    }
    this.unlockQueueAccess();
  }

  leaveQueue(login: string) {
    this.lockQueueAccess();
    if (this.isInQueue(login)) {
      this.queue = this.queue.filter((queuerLogin) => queuerLogin !== login);
      // console.log('leftQueue');
    } else {
      this.unlockQueueAccess();
      throw new Error('not in queue');
    }
    this.unlockQueueAccess();
  }

  matchPlayers() {
    this.lockQueueAccess();
    if (this.queue.length >= 2) {
      const player: Player = {
        home: this.queue.shift(),
        foreign: this.queue.shift(),
      };

      this.unlockQueueAccess();
      return player;
    }
    this.unlockQueueAccess();
  }

  private lockQueueAccess() {
    while (this.queueLock) {}
    this.queueLock = true;
  }

  private unlockQueueAccess() {
    this.queueLock = false;
  }

  joinInviteList(login: string) {
    this.lockInviteListAccess();
    if (!this.isInQueue(login) && !this.isInInviteList(login)) {
      this.inviteList.push(login);
    } else {
      this.unlockInviteListAccess();
      throw new Error('already waiting for a match');
    }
    this.unlockInviteListAccess();
  }

  leaveInviteList(login: string) {
    this.lockInviteListAccess();
    if (this.isInInviteList(login)) {
      this.inviteList = this.inviteList.filter(
        (inviterLogin) => inviterLogin !== login,
      );
    } else {
      this.unlockInviteListAccess();
      throw new Error('not inviting');
    }
    this.unlockInviteListAccess();
  }

  acceptInvite(recvLogin: string, sendLogin: string) {
    this.lockInviteListAccess();
    if (this.isInInviteList(sendLogin)) {
      const player: Player = {
        home: sendLogin,
        foreign: recvLogin,
      };
      this.inviteList = this.inviteList.filter(
        (inviterLogin) => inviterLogin !== sendLogin,
      );

      this.unlockInviteListAccess();
      return player;
    }
    this.unlockInviteListAccess();
    throw new Error('no invite');
  }

  private lockInviteListAccess() {
    while (this.inviteListLock) {}
    this.inviteListLock = true;
  }

  private unlockInviteListAccess() {
    this.inviteListLock = false;
  }

  private isInQueue(login: string) {
    const found = this.queue.find((queuerLogin) => queuerLogin === login);
    return found ? true : false;
  }

  private isInInviteList(login: string) {
    const found = this.inviteList.find(
      (inviterLogin) => inviterLogin === login,
    );
    return found ? true : false;
  }
}
