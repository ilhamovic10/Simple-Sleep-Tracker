import React, { useState, useEffect } from 'react';
import { formatDuration } from '../utils/format';
import { MoonIcon, SunIcon, SnoozeIcon } from './Icons';

interface SleepTrackerProps {
  isSleeping: boolean;
  startTime: string | null;
  onStart: () => void;
  onConfirmWakeUp: () => void;
  onTriggerAlarm: () => void;
  onSnooze: () => void;
  sleepGoal: number; // in milliseconds
  isAlarmRinging: boolean;
}

const SleepTracker: React.FC<SleepTrackerProps> = ({
  isSleeping,
  startTime,
  onStart,
  onConfirmWakeUp,
  onTriggerAlarm,
  onSnooze,
  sleepGoal,
  isAlarmRinging,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: number | null = null;
    if (isSleeping && startTime) {
      const goalInMs = sleepGoal;

      interval = window.setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        const currentDuration = now - start;
        setElapsedTime(currentDuration);

        // Automatically trigger alarm when goal is reached
        if (goalInMs > 0 && currentDuration >= goalInMs && !isAlarmRinging) {
            onTriggerAlarm();
        }
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isSleeping, startTime, sleepGoal, onTriggerAlarm, isAlarmRinging]);

  const renderContent = () => {
    if (isAlarmRinging) {
      return (
        <div className="text-center animate-pulse w-full">
          <p className="text-5xl font-bold text-amber-400 my-2">Wake Up!</p>
          <p className="text-slate-300">Your sleep goal has been reached.</p>
          <div className="flex w-full justify-center space-x-4 mt-8">
            <button
              onClick={onConfirmWakeUp}
              className="flex-1 py-6 bg-green-500/20 backdrop-blur-md border border-green-400/50 text-white rounded-xl flex flex-col items-center justify-center shadow-lg transform transition-all hover:scale-105 hover:bg-green-500/30 focus:outline-none focus:ring-4 focus:ring-green-400"
              aria-label="Stop Alarm"
            >
              <SunIcon className="w-10 h-10" />
              <span className="text-2xl font-bold mt-2">Stop</span>
            </button>
            <button
              onClick={onSnooze}
              className="flex-1 py-6 bg-sky-500/20 backdrop-blur-md border border-sky-400/50 text-white rounded-xl flex flex-col items-center justify-center shadow-lg transform transition-all hover:scale-105 hover:bg-sky-500/30 focus:outline-none focus:ring-4 focus:ring-sky-400"
              aria-label="Snooze"
            >
              <SnoozeIcon className="w-10 h-10" />
              <span className="text-2xl font-bold mt-2">Snooze</span>
            </button>
          </div>
        </div>
      );
    }

    if (isSleeping) {
      return (
        <>
          <div className="text-center mb-6">
            <p className="text-slate-400">Currently sleeping for...</p>
            <p className="text-5xl font-bold text-white tracking-wider my-2">
              {formatDuration(elapsedTime)}
            </p>
          </div>
          <button
            onClick={onConfirmWakeUp}
            className="w-full py-8 bg-amber-400/20 backdrop-blur-md border border-amber-300/50 text-white rounded-xl flex flex-row items-center justify-center space-x-4 shadow-lg transform transition-all hover:bg-amber-400/30 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
            aria-label="Wake Up"
          >
            <SunIcon className="w-10 h-10" />
            <span className="text-3xl font-bold">Wake Up</span>
          </button>
        </>
      );
    }

    return (
      <>
        <div className="text-center mb-6">
          <p className="text-slate-400">Ready to sleep?</p>
          <p className="text-5xl font-bold text-white my-2">Good Night</p>
        </div>
        <button
          onClick={onStart}
          className="w-full py-8 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/50 text-white rounded-xl flex flex-row items-center justify-center space-x-4 shadow-lg transform transition-all hover:bg-indigo-500/30 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-400"
          aria-label="Start Sleep"
        >
          <MoonIcon className="w-10 h-10" />
          <span className="text-3xl font-bold">Start Sleep</span>
        </button>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg w-full min-h-[356px]">
        {renderContent()}
    </div>
  );
};

export default SleepTracker;