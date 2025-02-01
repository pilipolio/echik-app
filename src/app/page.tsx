'use client';

import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { CustomChess } from './custom-chess';
import { kingToQueenScenario, knightCheckScenario } from './chess-scenario';

function App() {
  const [game, setGame] = useState<CustomChess>(new CustomChess());
  const [objectiveMet, setObjectiveMet] = useState(false);
  const scenario = knightCheckScenario;

  useEffect(() => {
    setGame(scenario.setupBoard());
  }, []);

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
    return true;
  }

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
          boardWidth={560}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
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