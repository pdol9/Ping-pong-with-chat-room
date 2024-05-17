import React, { useState, useEffect } from 'react';

interface TimerProps {
  timeInS: number,
  onFinish: () => void;
}

const Timer: React.FC<TimerProps> = ({ timeInS, onFinish }) => {
  const [seconds, setSeconds] = useState(timeInS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      onFinish();
    }
  }, [seconds, onFinish]);

  return (
    <div>
      {seconds > 0 && (
        <h1>{seconds}</h1>
      )}
    </div>
  );
};

export default Timer;
