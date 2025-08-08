import React, { useEffect, useState } from "react";
import sentences from "../data/sentences";

const TypingTest = () => {
  const generateMultiLineSentence = () => {
    // Generate 4-5 lines of text by combining multiple sentences
    const shuffled = [...sentences].sort(() => 0.5 - Math.random());
    let combinedText = "";
    let sentenceCount = 0;
    
    // Keep adding sentences until we have enough content for 4-5 lines
    while (combinedText.length < 300 && sentenceCount < 8) {
      combinedText += shuffled[sentenceCount % sentences.length] + " ";
      sentenceCount++;
    }
    
    return combinedText.trim();
  };

  const [sentence, setSentence] = useState(generateMultiLineSentence());
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isStarted, setIsStarted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  // Timer logic
  useEffect(() => {
    if (isStarted && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }

    if ((timeLeft === 0 || isFinished) && isStarted) {
      calculateStats();
    }
  }, [isStarted, timeLeft, isFinished]);

  const handleChange = (e) => {
    if (!isStarted) setIsStarted(true);

    const val = e.target.value;
    setInput(val);

    // Check for full sentence match
    if (val === sentence) {
      setIsFinished(true);
      calculateStats(val); // show stats early
    }
  };

  const getColoredText = () => {
    const inputChars = input.split("");
    return sentence.split("").map((char, index) => {
      let colorClass = "text-gray-400"; // Default grey color

      if (index < inputChars.length) {
        if (inputChars[index] === char) {
          colorClass = "text-green-400 bg-green-900/30"; // Better green highlighting with background
        } else {
          colorClass = "text-red-400 bg-red-900/30"; // Red for incorrect with background
        }
      } else if (index === inputChars.length) {
        colorClass = "text-gray-400 bg-blue-500/50"; // Cursor position
      }

      return (
        <span key={index} className={`${colorClass} font-mono`}>
          {char}
        </span>
      );
    });
  };

  const calculateStats = (text = input) => {
    const words = text.trim().split(" ").filter((w) => w !== "");
    const correctChars = text
      .split("")
      .filter((char, i) => char === sentence[i]).length;
    const totalChars = text.length;

    const timeTaken = 60 - timeLeft || 1; // avoid division by 0
    const wpmCalc = Math.round((words.length / timeTaken) * 60);
    const accuracyCalc = totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);

    setWpm(wpmCalc);
    setAccuracy(accuracyCalc);
  };

  const handleRestart = () => {
    setSentence(generateMultiLineSentence());
    setInput("");
    setTimeLeft(60);
    setIsStarted(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">⚡ Speed Typing Test</h1>
      
      <div className="mb-6 text-xl">
        <span className="text-gray-300">⏱️ Time Left: </span>
        <span className="font-bold text-yellow-400 text-2xl">{timeLeft}s</span>
      </div>

      {/* Text Display Box - Bigger text, 4-5 lines, better spacing */}
      <div className="w-full max-w-4xl mb-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <p className="text-2xl leading-relaxed font-mono text-gray-300 min-h-[140px] overflow-hidden">
            {getColoredText()}
          </p>
        </div>
      </div>

      {/* Input Box */}
      <input
        type="text"
        value={input}
        onChange={handleChange}
        disabled={isFinished || timeLeft === 0}
        placeholder="Start typing here..."
        className="p-4 w-full max-w-4xl rounded-lg bg-gray-800 border-2 border-gray-600 text-white text-xl font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        autoFocus
      />

      {/* Results Section */}
      {(isFinished || timeLeft === 0) && (
        <div className="mt-8 text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-3xl font-bold mb-4 text-blue-400">📊 Your Results</h2>
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-lg text-gray-300">Speed</p>
              <p className="text-3xl font-bold text-green-400">{wpm} WPM</p>
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-300">Accuracy</p>
              <p className="text-3xl font-bold text-blue-400">{accuracy}%</p>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 text-center text-gray-400 max-w-2xl">
        <p className="text-sm">
          💡 <strong>Tip:</strong> Type the text as accurately as possible. 
          Green highlights correct characters, red shows mistakes, and the blue highlight shows your current position.
        </p>
      </div>
    </div>
  );
};

export default TypingTest;
