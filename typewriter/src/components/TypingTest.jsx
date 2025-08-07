// TypingTestApp.jsx
import React, { useState, useEffect, useRef } from "react";
import randomSentences from "../data/sentences";

const TypingTestApp = () => {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(30);
  const [timeLeft, setTimeLeft] = useState(timer);
  const [started, setStarted] = useState(false);
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    setText(getRandomSentence());
  }, []);

  useEffect(() => {
    if (started && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (started && timeLeft === 0) {
      finishTest();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, started]);

  const getRandomSentence = () => {
    return randomSentences[Math.floor(Math.random() * randomSentences.length)];
  };

  const handleStart = () => {
    setStarted(true);
    setTimeLeft(timer);
    setInput("");
    setWpm(null);
    setAccuracy(null);
  };

  const handleChangeSentence = () => {
    setText(getRandomSentence());
    setInput("");
    setStarted(false);
    setWpm(null);
    setAccuracy(null);
    setTimeLeft(timer);
  };

  const handleChange = (e) => {
    if (!started) setStarted(true);
    setInput(e.target.value);

    if (e.target.value === text) {
      finishTest();
    }
  };

  const finishTest = () => {
    clearTimeout(timerRef.current);
    setStarted(false);
    const words = input.trim().split(" ").filter(Boolean);
    const correctChars = input.split("").filter((char, i) => char === text[i])
      .length;
    setWpm(Math.round((words.length / timer) * 60));
    setAccuracy(Math.round((correctChars / text.length) * 100));
  };

  const renderText = () => {
    return text.split("").map((char, i) => {
      let color = "text-gray-400";
      if (i < input.length) {
        color = char === input[i] ? "text-green-500" : "text-red-500";
      }
      return (
        <span key={i} className={`${color} text-xl sm:text-2xl md:text-3xl`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-4xl text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Typing Test</h1>

        <div className="bg-gray-800 rounded-lg p-6 overflow-y-auto max-h-56 border border-gray-700">
          <div className="text-left flex flex-wrap leading-relaxed text-lg">
            {renderText()}
          </div>
        </div>

        <input
          className="mt-4 w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-lg text-white focus:outline-none"
          placeholder="Start typing here..."
          value={input}
          onChange={handleChange}
          disabled={timeLeft === 0 || !text}
        />

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <select
            value={timer}
            onChange={(e) => {
              setTimer(Number(e.target.value));
              setTimeLeft(Number(e.target.value));
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            <option value={15}>15 sec</option>
            <option value={30}>30 sec</option>
            <option value={60}>60 sec</option>
          </select>

          <button
            onClick={handleChangeSentence}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
          >
            Change Sentence
          </button>
        </div>

        <div className="text-lg mt-4">
          <p>Time Left: {timeLeft}s</p>
          {wpm !== null && <p>WPM: {wpm}</p>}
          {accuracy !== null && <p>Accuracy: {accuracy}%</p>}
        </div>
      </div>
    </div>
  );
};

export default TypingTestApp;
