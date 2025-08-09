import React, { useState, useEffect } from 'react';
import './App.css';

// Fetch lyrics from Lyrics.ovh
const getLyrics = async (artist, title) => {
  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
    const data = await res.json();
    return data.lyrics ? data.lyrics.replace(/\n/g, ' ') : "Lyrics not found.";
  } catch (error) {
    console.error(error);
    return "Error fetching lyrics.";
  }
};

function App() {
  const [sentence, setSentence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(100);
  const [timer, setTimer] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [intervalId, setIntervalId] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    fetchLyrics(); // fetch initial lyrics
  }, []);

  useEffect(() => {
    if (started && timeLeft > 0 && !finished) {
      const id = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    }

    if (timeLeft === 0 && !finished) {
      calculateStats();
      setFinished(true);
    }
  }, [started, timeLeft, finished]);

  useEffect(() => {
    if (userInput === sentence && !finished) {
      calculateStats();
      setFinished(true);
      clearInterval(intervalId);
    }
  }, [userInput, sentence, finished, intervalId]);

  const fetchLyrics = async () => {
    // You can later make this random or user-input
    const artist = "Coldplay";
    const title = "Yellow";
    const lyrics = await getLyrics(artist, title);
    setSentence(lyrics);
  };

  const calculateStats = () => {
    const words = userInput.trim().split(' ').filter(word => word).length;
    const minutes = (timer - timeLeft) / 60 || 1;
    const calculatedWpm = Math.round(words / minutes);

    const correctChars = userInput.split('').filter((char, i) => char === sentence[i]).length;
    const calculatedAccuracy = Math.round((correctChars / userInput.length) * 100) || 100;

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
    setTotalWords(prev => prev + words);

    if (calculatedAccuracy === 100) {
      setCurrentStreak(prev => prev + 1);
      setBestStreak(prev => Math.max(prev, currentStreak + 1));
    } else {
      setCurrentStreak(0);
    }
  };

  const handleKeyPress = (e) => {
    if (finished) return;
    const key = e.key;

    if (!started) {
      setStarted(true);
      setTimeLeft(timer);
    }

    if (key === 'Backspace') {
      setUserInput(prev => prev.slice(0, -1));
    } else if (key.length === 1) {
      if (userInput.length < sentence.length) {
        setUserInput(prev => prev + key);
      }
    }
  };

  const resetTest = () => {
    fetchLyrics(); // get new song
    setUserInput('');
    setStarted(false);
    setFinished(false);
    setWpm(null);
    setAccuracy(100);
    setTimeLeft(timer);
    clearInterval(intervalId);
  };

  const getProgressWidth = () => {
    return (userInput.length / sentence.length) * 100;
  };

  return (
    <div className="lyric-playground" tabIndex="0" onKeyDown={handleKeyPress}>
      {/* Header */}
      <div className="playground-header">
        <h1>🎵 Lyric Playground 🎵</h1>
        <p className="subtitle">Type along with your favorite lyrics!</p>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <span className="stat-label">Best Streak</span>
            <span className="stat-value">{bestStreak}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <span className="stat-label">Current Streak</span>
            <span className="stat-value">{currentStreak}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <span className="stat-label">Total Words</span>
            <span className="stat-value">{totalWords}</span>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      {!started && (
        <div className="game-controls">
          <div className="time-selector">
            <label>🕐 Choose Your Challenge:</label>
            <div className="time-buttons">
              <button 
                className={timer === 30 ? 'time-btn active' : 'time-btn'}
                onClick={() => { setTimer(30); setTimeLeft(30); }}
              >
                30s Sprint
              </button>
              <button 
                className={timer === 60 ? 'time-btn active' : 'time-btn'}
                onClick={() => { setTimer(60); setTimeLeft(60); }}
              >
                60s Classic
              </button>
              <button 
                className={timer === 90 ? 'time-btn active' : 'time-btn'}
                onClick={() => { setTimer(90); setTimeLeft(90); }}
              >
                90s Marathon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer & Progress */}
      <div className="game-status">
        <div className="timer-display">
          <span className="timer-icon">⏰</span>
          <span className="timer-text">{timeLeft}s</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressWidth()}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {Math.round(getProgressWidth())}% Complete
          </span>
        </div>
      </div>

      {/* Lyric Display */}
      <div className="lyric-stage">
        <div className="lyric-text">
          {sentence.split('').map((char, idx) => {
            let className = 'char';
            if (idx < userInput.length) {
              className += userInput[idx] === char ? ' correct' : ' incorrect';
            } else if (idx === userInput.length) {
              className += ' cursor';
            }
            return (
              <span key={idx} className={className}>
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-zone">
        <button className="action-btn new-song" onClick={resetTest}>
          🎲 New Song
        </button>
        
        {started && !finished && (
          <div className="live-stats">
            <span>🚀 Live WPM: {userInput.length > 0 ? Math.round((userInput.trim().split(' ').length / ((timer - timeLeft) / 60)) || 0) : 0}</span>
          </div>
        )}
      </div>

      {/* Results Modal */}
      {finished && (
        <div className="results-modal">
          <div className="results-content">
            <h2>🎉 Song Complete! 🎉</h2>
            <div className="final-stats">
              <div className="final-stat">
                <span className="final-stat-label">Words Per Minute</span>
                <span className="final-stat-value wpm">{wpm}</span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Accuracy</span>
                <span className="final-stat-value accuracy">{accuracy}%</span>
              </div>
              {accuracy === 100 && (
                <div className="perfect-badge">
                  ✨ Perfect Performance! ✨
                </div>
              )}
            </div>
            <div className="results-actions">
              <button className="results-btn primary" onClick={resetTest}>
                🎵 Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!started && (
        <div className="instructions">
          <p>🎯 <strong>How to Play:</strong> Just start typing to begin! Match the lyrics exactly as shown.</p>
          <p>🏆 <strong>Goal:</strong> Type accurately and build your streak for the highest score!</p>
        </div>
      )}
    </div>
  );
}

export default App;
