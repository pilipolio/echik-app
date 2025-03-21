'use client';

import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { CustomChess, Square } from './custom-chess';
import { knightCheckScenario } from './chess-scenario';

// https://github.com/hexgrad/kokoro/tree/main/kokoro.js

function App() {
  const [game, setGame] = useState<CustomChess>(new CustomChess());
  const [objectiveMet, setObjectiveMet] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const scenario = knightCheckScenario;

  useEffect(() => {
    setGame(scenario.setupBoard());
  }, [scenario]);

  // Get valid moves for a piece without modifying the game state
  function getValidMovesForPiece(square: Square): Square[] {
    const piece = game.get(square);
    if (!piece) return [];
    
    // Use the built-in getLegalMoves method from CustomChess
    return game.getLegalMoves(square);
  }

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    const newGame = new CustomChess(game.fen());
    const piece = newGame.get(sourceSquare);

    if (!scenario.isValidMove(piece, sourceSquare, targetSquare)) {
      return false;
    }

    try {
      newGame.move({ from: sourceSquare, to: targetSquare });
    } catch {
      return false; // Invalid move
    }

    if (scenario.checkObjective(newGame)) {
      setObjectiveMet(true);
    }

    setGame(newGame);
    setSelectedSquare(null);
    setValidMoves([]);
    return true;
  }

  function onSquareClick(square: Square) {
    const piece = game.get(square);
    
    // If clicking on a piece that can be moved according to the scenario
    if (piece && scenario.isValidMove(piece, square, square)) {
      setSelectedSquare(square);
      // Get valid moves for the selected piece
      const moves = getValidMovesForPiece(square);
      setValidMoves(moves);
    } else if (selectedSquare) {
      // If a piece is already selected and we click on a valid move square
      if (validMoves.includes(square)) {
        onDrop(selectedSquare, square);
      } else {
        // Deselect if clicking elsewhere
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  }

  // Handle piece drag begin to show valid moves
  function onPieceDragBegin(piece: string, sourceSquare: Square) {
    const chessPiece = game.get(sourceSquare);
    if (chessPiece && scenario.isValidMove(chessPiece, sourceSquare, sourceSquare)) {
      setSelectedSquare(sourceSquare);
      const moves = getValidMovesForPiece(sourceSquare)
      setValidMoves(moves);
    }
  }

  // Handle piece drag end to clear valid moves if not dropped on a valid square
  function onPieceDragEnd() {
    // We'll keep the valid moves visible until the piece is dropped
    // The onDrop function will clear them if the move is valid
  }

  // Create custom styles for valid move indicators
  const customSquareStyles: { [square: string]: React.CSSProperties } = {};
  
  // Add light grey circles to valid move squares using Radial Gradient approach
  validMoves.forEach((square) => {
    customSquareStyles[square] = {
      backgroundImage: 'radial-gradient(circle, rgba(128, 128, 128, 0.5) 35%, transparent 36%)',
      backgroundSize: '50% 50%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  });

  return (
    <div style={{ 
      display: 'flex', 
      gap: '40px', 
      padding: '40px', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div style={{ width: '560px' }}>
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          boardWidth={560}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
          customSquareStyles={customSquareStyles}
        />
      </div>
      
      <div style={{ maxWidth: '400px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '16px' }}>
          {scenario.title}
        </h2>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#27ae60', margin: '0 0 12px 0' }}>
            Objective 🎯
          </h3>
          <p style={{ margin: '0', lineHeight: '1.6' }}>
            {scenario.objective}<br />
            <span style={{ fontSize: '0.9em', color: '#7f8c8d' }}>
              {scenario.hint}
            </span>
          </p>
          
          {objectiveMet && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#2ecc71',
              color: 'white',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🎉</span>
              <span>Great job! You did it!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;