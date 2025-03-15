import { CustomChess, Square, Piece } from './custom-chess';

export interface ChessScenario {
  title: string;
  objective: string;
  hint: string;
  setupBoard: () => CustomChess;
  isValidMove: (piece: Piece | null, from: Square, to: Square) => boolean;
  checkObjective: (game: CustomChess) => boolean;
}

export const kingToQueenScenario: ChessScenario = {
  title: "Chess Learning Activity",
  objective: "Help the white king reach e8 to meet his queen!",
  hint: "(Drag the white king to move him one square at a time)",
  
  setupBoard: () => {
    const game = new CustomChess();
    game.clear();
    game.put({ type: 'k', color: 'w' }, 'e1');
    game.put({ type: 'q', color: 'w' }, 'd8');
    return game;
  },
  
  isValidMove: (piece: Piece | null) => {
    return piece?.type === 'k' && piece?.color === 'w';
  },
  
  checkObjective: (game: CustomChess) => {
    const kingPosition = game.get('e8');
    return kingPosition?.type === 'k' && kingPosition?.color === 'w';
  }
};

export const knightCheckScenario: ChessScenario = {
  title: "Knight's Challenge",
  objective: "Use the white knight to check the black king!",
  hint: "(Move only the white knight to deliver check)",
  
  setupBoard: () => {
    return new CustomChess('N7/8/8/3P4/2P2P2/4P3/8/7k w - - 0 1');
  },
  
  isValidMove: (piece: Piece | null) => {
    return piece?.type === 'n' && piece?.color === 'w';
  },
  
  checkObjective: (game: CustomChess) => {
    return game.get('f2')?.type === 'n' || game.get('g3')?.type === 'n';
  }
}; 