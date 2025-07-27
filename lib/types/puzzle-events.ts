export type PuzzleEventType = 'puzzle_opened' | 'puzzle_failed' | 'puzzle_passed';

export interface PuzzleEvent {
  type: PuzzleEventType;
  puzzleNumber: number;
  puzzleType: 'hands' | 'fboy' | 'cute';
  attempts?: number;
  timestamp: Date;
  expectedPuzzleState?: 'puzzle1' | 'puzzle2' | 'puzzle3' | 'completed';
}

export interface PuzzleOpenedEvent extends PuzzleEvent {
  type: 'puzzle_opened';
}

export interface PuzzleFailedEvent extends PuzzleEvent {
  type: 'puzzle_failed';
  attempts: number;
}

export interface PuzzlePassedEvent extends PuzzleEvent {
  type: 'puzzle_passed';
  attempts: number;
}

export type AnyPuzzleEvent = PuzzleOpenedEvent | PuzzleFailedEvent | PuzzlePassedEvent;