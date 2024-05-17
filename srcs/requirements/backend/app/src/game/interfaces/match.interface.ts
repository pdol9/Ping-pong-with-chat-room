import { UserPreview } from 'src/user/interfaces/user.interface';

export interface GameResults {
  id: string;
  homePlayer: UserPreview;
  foreignPlayer: UserPreview;
  homeScore: number;
  foreignScore: number;
  created_at: Date;
}

export interface MatchHistory {
  matches: GameResults[];
}
