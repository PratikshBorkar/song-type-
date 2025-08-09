import React, { useState, useEffect } from 'react';
import { fetchLyrics, getRandomSampleLyrics, searchSongs, getPopularSongs, testAllLyricsServices } from './services/lyricsAPI';
import { getTestLyrics } from './services/testAPI';
import './App.css';

function App() {
  // Simple test to ensure React is rendering
  console.log('App component is rendering');
  
  const [sentence, setSentence] = useState('Type this sample text to test the typing interface while we load lyrics');
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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [error, setError] = useState('');

  // Load initial lyrics and popular songs
  useEffect(() => {
    loadInitialContent();
  }, []);

  const loadInitialContent = async () => {
    setLoading(true);
    try {
      const lyrics = getRandomSampleLyrics();
      setSentence(lyrics);
      const popular = getPopularSongs();
      setSearchResults(popular);
    } catch (error) {
      console.error('Error loading initial content:', error);
      setSentence('The quick brown fox jumps over the lazy dog');
      setError('Failed to load initial content');
    }
    setLoading(false);
  };

  // Load sample lyrics on component mount
  useEffect(() => {
    console.log('App component mounted, loading sample lyrics...');
    loadRandomLyrics();
  }, []);

  const loadRandomLyrics = async () => {
    setLoading(true);
    setError('');
    try {
      const lyrics = getRandomSampleLyrics();
      setSentence(lyrics);
      setSelectedSong(null);
    } catch (error) {
      console.error('Error loading random lyrics:', error);
      setSentence('The quick brown fox jumps over the lazy dog');
      setError('Failed to load random lyrics');
    }
    setLoading(false);
  };

  const loadSongLyrics = async (artist, title) => {
    setLoading(true);
    setError('');
    setSelectedSong({ artist, title });
    
    try {
      console.log(`Loading lyrics for: ${artist} - ${title}`);
      const lyrics = await fetchLyrics(artist, title);
      
      // Check if we got actual lyrics or fallback
      const sampleLyrics = getRandomSampleLyrics();
      const isUsingFallback = lyrics.includes('happy birthday') || 
                             lyrics.includes('twinkle twinkle') || 
                             lyrics.includes('row row row') ||
                             lyrics.includes('mary had a little lamb') ||
                             lyrics.includes('london bridge') ||
                             lyrics.includes('wheels on the bus') ||
                             lyrics === sampleLyrics;
      
      setSentence(lyrics);
      
      if (isUsingFallback) {
        setError(`Could not find lyrics for "${title}" by ${artist}. Using sample text instead.`);
      } else {
        console.log('Successfully loaded song lyrics!');
        setError(''); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error loading song lyrics:', error);
      const fallbackLyrics = getRandomSampleLyrics();
      setSentence(fallbackLyrics);
      setError(`Failed to load "${title}" by ${artist}. Using sample text instead.`);
    }
    setLoading(false);
  };

  // Enhanced test function that tests all services including Musixmatch
  const testAPI = async () => {
    console.log('=== Testing All Lyrics Services ===');
    try {
      setLoading(true);
      setError('🧪 Testing Musixmatch and Genius APIs...');
      
      // Run the simplified API test (removed ovh API as requested)
      const testResults = await testAllLyricsServices();
      console.log('API Test Results:', testResults);
      
      // Create detailed status message
      let statusMessage = '🔍 API Test Results:\n';
      
      if (testResults.musixmatch?.success) {
        statusMessage += '✅ Musixmatch API: Working\n';
      } else {
        statusMessage += '❌ Musixmatch API: ' + (testResults.musixmatch?.error || 'Failed') + '\n';
      }
      
      if (testResults.genius?.success) {
        statusMessage += '✅ Genius API: Working\n';
      } else {
        statusMessage += '❌ Genius API: ' + (testResults.genius?.error || 'Failed') + '\n';
      }
      
      // Note about removed API
      statusMessage += 'ℹ️ Lyrics.ovh API: Removed as requested\n';
      
      statusMessage += `\n📊 Overall Status: ${testResults.overall.toUpperCase()}`;
      
      // Set sample text for testing
      setSentence(getTestLyrics());
      setError(statusMessage);
      
    } catch (error) {
      console.error('Comprehensive test failed:', error);
      setSentence(getTestLyrics());
      setError(`❌ Test failed: ${error.message}. Check browser console for details.`);
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      const popular = getPopularSongs();
      setSearchResults(popular);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const results = await searchSongs(query);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No songs found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Showing popular songs instead.');
      const popular = getPopularSongs();
      setSearchResults(popular);
    }
    setLoading(false);
  };

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

  const calculateStats = () => {
    const words = userInput.trim().split(' ').filter(word => word).length;
    const minutes = (timer - timeLeft) / 60 || 1;
    const calculatedWpm = Math.round(words / minutes);
    
    // Calculate accuracy
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
    // Don't handle key presses if user is typing in an input field or button is focused
    if (e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.tagName === 'BUTTON' ||
        e.target.type === 'button' ||
        e.target.type === 'submit') {
      return;
    }
    
    // Don't start if no sentence is loaded or if finished
    if (!sentence || finished) return;
    
    const key = e.key;

    // Start the test when user types any printable character or backspace
    if (!started && (key.length === 1 || key === 'Backspace')) {
      setStarted(true);
      setTimeLeft(timer);
    }

    if (key === 'Backspace') {
      e.preventDefault();
      setUserInput(prev => prev.slice(0, -1));
    } else if (key.length === 1 && !/[F1-F12]/.test(key)) {
      e.preventDefault();
      if (userInput.length < sentence.length) {
        setUserInput(prev => prev + key);
      }
    }
  };

  const handleTimeSelect = (e) => {
    const newTime = Number(e.target.value);
    setTimer(newTime);
    setTimeLeft(newTime);
  };

  const resetTest = async () => {
    await loadRandomLyrics();
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
    <div 
      className="lyric-playground" 
      tabIndex="0" 
      onKeyDown={handleKeyPress}
      onClick={(e) => {
        // Only focus on the main container if not clicking on an input or button
        if (!['INPUT', 'BUTTON', 'TEXTAREA'].includes(e.target.tagName)) {
          e.currentTarget.focus();
        }
      }}
    >
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
          {/* Song Search */}
          <div className="song-search">
            <h3>🎵 Find Your Song</h3>
            
            {/* Search Input */}
            <form 
              className="search-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchQuery);
              }}
            >
              <input
                type="text"
                placeholder="Search for any song or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoComplete="off"
              />
              <button 
                type="submit"
                className="search-btn"
                disabled={loading}
              >
                🔍 Search
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Current Selection */}
            {selectedSong && (
              <div className="current-selection">
                🎵 Selected: <strong>{selectedSong.artist} - {selectedSong.title}</strong>
              </div>
            )}

            {/* Search Results / Popular Songs */}
            <div className="song-results">
              <h4>{searchQuery ? 'Search Results' : 'Popular Songs'}</h4>
              <div className="songs-grid">
                {searchResults.map((song, index) => (
                  <button
                    key={index}
                    className="song-btn"
                    onClick={() => loadSongLyrics(song.artist, song.title)}
                    disabled={loading}
                  >
                    <div className="song-info">
                      <div className="song-title">{song.title}</div>
                      <div className="song-artist">{song.artist}</div>
                      {song.language && song.language !== 'English' && (
                        <div className="song-language">🌍 {song.language}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="random-option">
              <button 
                className="random-btn"
                onClick={loadRandomLyrics}
                disabled={loading}
              >
                🎲 Random Sample Text
              </button>
              <button 
                className="test-btn"
                onClick={testAPI}
                disabled={loading}
                style={{ marginLeft: '10px', background: '#e53e3e' }}
              >
                🔬 Test Musixmatch + Genius
              </button>
            </div>
          </div>
          
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
        <div 
          className={`lyric-text ${!started && !loading && sentence ? 'clickable' : ''}`}
          onClick={() => {
            if (!started && !loading && sentence) {
              const lyricArea = document.querySelector('.lyric-text');
              lyricArea.focus();
            }
          }}
          tabIndex={!started && !loading && sentence ? "0" : "-1"}
        >
          {loading ? (
            <div className="loading">🎵 Loading lyrics...</div>
          ) : sentence ? (
            <>
              {!started && (
                <div className="start-hint">Click here or start typing to begin!</div>
              )}
              {sentence.split('').map((char, idx) => {
                let className = 'char';
                if (idx < userInput.length) {
                  className += userInput[idx] === char ? ' correct' : ' incorrect';
                } else if (idx === userInput.length) {
                  className += ' cursor';
                }
                return (
                  <span key={idx} className={className}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </>
          ) : (
            <div className="no-lyrics">Select a song or search to get started!</div>
          )}
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
