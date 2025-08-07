import React, { useEffect, useState } from "react";
import { sentences } from "../data/sentences";

const TypingTest = () => {
  const getRandomSentence = () =>
    sentences[Math.floor(Math.random() * sentences.length)];

  const [sentence, setSentence] = useState(getRandomSentence());
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [isStarted, setIsStarted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Start timer on first key press
  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }

    if (timeLeft === 0) {
      calculateStats();
    }
  }, [isStarted, timeLeft]);

  const handleChange = (e) => {
    if (!isStarted) setIsStarted(true);
    setInput(e.target.value);
  };

  const getColoredText = () => {
    const inputChars = input.split("");
    return sentence.split("").map((char, index) => {
      let color = "black";
      if (index < inputChars.length) {
        color = inputChars[index] === char ? "green" : "red";
      }
      return (
        <span key={index} style={{ color, fontWeight: "bold" }}>
          {char}
        </span>
      );
    });
  };

  const calculateStats = () => {
    const words = input.trim().split(" ").filter((w) => w !== "");
    const correctChars = input
      .split("")
      .filter((char, i) => char === sentence[i]).length;
    const totalChars = input.length;

    const wpmCalc = Math.round((words.length / 1)); // since time is 60 seconds = 1 min
    const accuracyCalc = totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);

    setWpm(wpmCalc);
    setAccuracy(accuracyCalc);
  };

  const handleRestart = () => {
    setSentence(getRandomSentence());
    setInput("");
    setTimeLeft(60);
    setIsStarted(false);
    setWpm(0);
    setAccuracy(100);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Typing Test</h2>
      <p style={{ fontSize: "20px" }}>
        Time Left: <strong>{timeLeft}s</strong>
      </p>
      <p style={{ fontSize: "24px", minHeight: "30px" }}>{getColoredText()}</p>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        disabled={timeLeft === 0}
        placeholder="Start typing here..."
        style={{
          padding: "10px",
          width: "70%",
          fontSize: "18px",
          marginBottom: "20px",
        }}
      />
      {timeLeft === 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results</h3>
          <p>WPM: {wpm}</p>
          <p>Accuracy: {accuracy}%</p>
          <button onClick={handleRestart} style={{ marginTop: "10px" }}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
