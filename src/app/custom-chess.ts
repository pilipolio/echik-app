export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Square = string;

export interface Piece {
    type: PieceType;
    color: PieceColor;
}

interface MoveOptions {
    from: Square;
    to: Square;
}

export class CustomChess {
    private board: (Piece | null)[][];
    
    constructor(fen?: string) {
        // Initialize empty board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // If FEN is provided, set up the position
        if (fen) {
            const [position] = fen.split(' '); // Get just the piece placement part
            const rows = position.split('/');
            
            rows.forEach((row, rank) => {
                let file = 0;
                for (const char of row) {
                    if (/\d/.test(char)) {
                        // Skip empty squares
                        file += parseInt(char);
                    } else {
                        // Place piece
                        const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
                        const type = char.toLowerCase() as PieceType;
                        this.board[rank][file] = { type, color };
                        file++;
                    }
                }
            });
        }
    }

    private squareToCoords(square: Square): [number, number] {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(square[1]);
        return [rank, file];
    }

    private coordsToSquare(rank: number, file: number): Square {
        return `${String.fromCharCode('a'.charCodeAt(0) + file)}${8 - rank}`;
    }

    put(piece: Piece, square: Square): boolean {
        const [rank, file] = this.squareToCoords(square);
        
        // Validate coordinates
        if (rank < 0 || rank > 7 || file < 0 || file > 7) {
            return false;
        }

        this.board[rank][file] = piece;
        return true;
    }

    fen(): string {
        const rows: string[] = [];
        
        // Process each rank
        for (let rank = 0; rank < 8; rank++) {
            let emptySquares = 0;
            let rowString = '';
            
            // Process each file in the rank
            for (let file = 0; file < 8; file++) {
                const piece = this.board[rank][file];
                
                if (piece === null) {
                    emptySquares++;
                } else {
                    // If there were empty squares before this piece, add the count
                    if (emptySquares > 0) {
                        rowString += emptySquares;
                        emptySquares = 0;
                    }
                    // Add the piece (uppercase for white, lowercase for black)
                    const pieceChar = piece.color === 'w' 
                        ? piece.type.toUpperCase() 
                        : piece.type.toLowerCase();
                    rowString += pieceChar;
                }
            }
            
            // Add any remaining empty squares at the end of the rank
            if (emptySquares > 0) {
                rowString += emptySquares;
            }
            
            rows.push(rowString);
        }

        // Join ranks with '/' and add default values for other FEN fields
        return `${rows.join('/')} w KQkq - 0 1`;
    }

    clear(): void {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                this.board[rank][file] = null;
            }
        }
    }

    get(square: Square): Piece | null {
        const [rank, file] = this.squareToCoords(square);
        return this.board[rank][file];
    }

    private isLegalKingMove(from: Square, to: Square): boolean {
        const [fromRank, fromFile] = this.squareToCoords(from);
        const [toRank, toFile] = this.squareToCoords(to);
        
        // King can move one square in any direction
        const rankDiff = Math.abs(toRank - fromRank);
        const fileDiff = Math.abs(toFile - fromFile);
        
        return rankDiff <= 1 && fileDiff <= 1 && (rankDiff > 0 || fileDiff > 0);
    }

    private isLegalQueenMove(from: Square, to: Square): boolean {
        return this.isLegalRookMove(from, to) || this.isLegalBishopMove(from, to);
    }

    private isLegalRookMove(from: Square, to: Square): boolean {
        const [fromRank, fromFile] = this.squareToCoords(from);
        const [toRank, toFile] = this.squareToCoords(to);
        
        // Rook must move either horizontally or vertically
        return fromRank === toRank || fromFile === toFile;
    }

    private isLegalBishopMove(from: Square, to: Square): boolean {
        const [fromRank, fromFile] = this.squareToCoords(from);
        const [toRank, toFile] = this.squareToCoords(to);
        
        // Bishop must move diagonally
        return Math.abs(toRank - fromRank) === Math.abs(toFile - fromFile);
    }

    private isLegalKnightMove(from: Square, to: Square): boolean {
        const [fromRank, fromFile] = this.squareToCoords(from);
        const [toRank, toFile] = this.squareToCoords(to);
        
        const rankDiff = Math.abs(toRank - fromRank);
        const fileDiff = Math.abs(toFile - fromFile);
        
        // Knight moves in L-shape: 2 squares in one direction and 1 in the other
        return (rankDiff === 2 && fileDiff === 1) || (rankDiff === 1 && fileDiff === 2);
    }

    private isLegalPawnMove(from: Square, to: Square, piece: Piece): boolean {
        const [fromRank, fromFile] = this.squareToCoords(from);
        const [toRank, toFile] = this.squareToCoords(to);
        
        const direction = piece.color === 'w' ? -1 : 1; // White moves up (-1), Black moves down (+1)
        const startRank = piece.color === 'w' ? 6 : 1;  // Starting rank for pawns
        
        // Basic one square forward move
        if (fromFile === toFile && toRank === fromRank + direction) {
            return true;
        }
        
        // Two square forward move from starting position
        if (fromFile === toFile && fromRank === startRank && 
            toRank === fromRank + (2 * direction)) {
            return true;
        }
        
        // Capture moves (diagonal)
        if (Math.abs(toFile - fromFile) === 1 && toRank === fromRank + direction) {
            const targetPiece = this.get(to);
            return targetPiece !== null && targetPiece.color !== piece.color;
        }
        
        return false;
    }

    move(options: MoveOptions): boolean {
        const piece = this.get(options.from);
        if (!piece) return false;

        // Validate move based on piece type
        let isLegalMove = false;
        switch (piece.type) {
            case 'k':
                isLegalMove = this.isLegalKingMove(options.from, options.to);
                break;
            case 'q':
                isLegalMove = this.isLegalQueenMove(options.from, options.to);
                break;
            case 'r':
                isLegalMove = this.isLegalRookMove(options.from, options.to);
                break;
            case 'b':
                isLegalMove = this.isLegalBishopMove(options.from, options.to);
                break;
            case 'n':
                isLegalMove = this.isLegalKnightMove(options.from, options.to);
                break;
            case 'p':
                isLegalMove = this.isLegalPawnMove(options.from, options.to, piece);
                break;
        }

        if (!isLegalMove) return false;

        // Remove piece from source
        const [fromRank, fromFile] = this.squareToCoords(options.from);
        this.board[fromRank][fromFile] = null;
        
        // Place piece at target
        return this.put(piece, options.to);
    }

    getLegalMoves(square: Square): Square[] {
        const piece = this.get(square);
        if (!piece) return [];

        const moves: Square[] = [];

        // Check all possible squares based on piece type
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const targetSquare = this.coordsToSquare(r, f);
                if (this.move({ from: square, to: targetSquare })) {
                    // If move is legal, add it to moves list and restore the piece
                    moves.push(targetSquare);
                    // Undo the move
                    this.put(piece, square);
                }
            }
        }

        return moves;
    }
}
