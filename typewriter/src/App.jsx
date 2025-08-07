import React, { useState, useEffect } from 'react';
import randomSentences from './data/sentences';
import './App.css';

const getRandomSentence = () =>
  randomSentences[Math.floor(Math.random() * randomSentences.length)];

function App() {
  const [sentence, setSentence] = useState(getRandomSentence());
  const [userInput, setUserInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(null);
  const [timer, setTimer] = useState(60); // default 60 seconds
  const [timeLeft, setTimeLeft] = useState(60);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (started && timeLeft > 0 && !finished) {
      const id = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    }

    if (timeLeft === 0 && !finished) {
      calculateWPM();
      setFinished(true);
    }
  }, [started, timeLeft, finished]);

  useEffect(() => {
    if (userInput === sentence && !finished) {
      calculateWPM();
      setFinished(true);
      clearInterval(intervalId);
    }
  }, [userInput]);

  const calculateWPM = () => {
    const words = userInput.trim().split(' ').length;
    const minutes = (timer - timeLeft) / 60;
    const calculatedWpm = Math.round(words / minutes);
    setWpm(calculatedWpm);
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

  const handleTimeSelect = (e) => {
    const newTime = Number(e.target.value);
    setTimer(newTime);
    setTimeLeft(newTime);
  };

  const resetTest = () => {
    setSentence(getRandomSentence());
    setUserInput('');
    setStarted(false);
    setFinished(false);
    setWpm(null);
    setTimeLeft(timer);
    clearInterval(intervalId);
  };

  return (
    <div className="app" tabIndex="0" onKeyDown={handleKeyPress}>
      <h1>Typing Test</h1>

      {!started && (
        <div className="time-select">
          <label>Select Time:</label>
          <select onChange={handleTimeSelect} value={timer}>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
            <option value={90}>90s</option>
          </select>
        </div>
      )}

      <div className="timer">
        Time Left: {timeLeft}s
      </div>

      <div className="box">
        {sentence.split('').map((char, idx) => {
          let color = '';
          if (idx < userInput.length) {
            color = userInput[idx] === char ? 'correct' : 'incorrect';
          }
          return (
            <span key={idx} className={color}>
              {char}
            </span>
          );
        })}
      </div>

      <div className="controls">
        <button onClick={resetTest}>Change Sentence</button>
        {finished && wpm && <p className="wpm">Your WPM: {wpm}</p>}
      </div>
    </div>
  );
}

export default App;
