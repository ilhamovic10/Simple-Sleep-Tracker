import React from 'react';
import type { SleepSession } from '../types';
import { formatDurationForLog, formatTime, formatDate } from '../utils/format';
import { BedIcon } from './Icons';

interface SleepHistoryProps {
  history: SleepSession[];
  sleepGoal: number; // in milliseconds
}

const SleepHistory: React.FC<SleepHistoryProps> = ({ history, sleepGoal }) => {
  const reversedHistory = [...history].reverse();

  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-semibold text-slate-200 mb-4 text-center">Sleep Log</h2>
      {reversedHistory.length === 0 ? (
        <div className="text-center text-slate-400 bg-slate-800 p-6 rounded-lg">
            <p>Your sleep history will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reversedHistory.map((session) => {
            const goalMet = session.duration >= sleepGoal;

            return (
                <li
                key={session.id}
                className="bg-slate-800 p-4 rounded-lg shadow-md flex items-center justify-between"
                >
                <div className="flex items-center space-x-4">
                    <BedIcon className={`w-6 h-6 flex-shrink-0 ${goalMet ? 'text-green-400' : 'text-sky-400'}`} />
                    <div>
                    <p className="font-semibold text-slate-100">{formatDate(session.startTime)}</p>
                    <p className="text-sm text-slate-400">
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </p>
                    </div>
                </div>
                <p className="text-lg font-bold text-slate-100">{formatDurationForLog(session.duration)}</p>
                </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SleepHistory;