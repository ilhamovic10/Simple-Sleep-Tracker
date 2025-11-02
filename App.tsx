import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';

import type { SleepSession } from './types';
import SleepTracker from './components/SleepTracker';
import SleepHistory from './components/SleepHistory';
import SleepChart from './components/SleepChart';
import NotificationSettings from './components/NotificationSettings';
import Navigation from './components/Navigation';
import { formatDurationForLog } from './utils/format';

type Page = 'tracker' | 'history';

const App: React.FC = () => {
  const [isSleeping, setIsSleeping] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [history, setHistory] = useState<SleepSession[]>([]);
  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>('tracker');
  
  // Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [sleepGoal, setSleepGoal] = useState<number>(8 * 60 * 60 * 1000); // in milliseconds
  const [selectedAlarm, setSelectedAlarm] = useState<string>('Beep');
  const [snoozeDuration, setSnoozeDuration] = useState<number>(5); // in minutes
  const [areSettingsConfirmed, setAreSettingsConfirmed] = useState<boolean>(true);
  const [settingsReminder, setSettingsReminder] = useState<string>('');


  // AI Summary
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);
  const snoozeTimeoutRef = useRef<number | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('sleepHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedGoal = localStorage.getItem('sleepGoal');
      if (savedGoal) {
        setSleepGoal(parseInt(savedGoal, 10) || (8 * 60 * 60 * 1000));
      }
      const savedAlarm = localStorage.getItem('selectedAlarm');
      if (savedAlarm) {
        setSelectedAlarm(savedAlarm);
      }
      const savedSnooze = localStorage.getItem('snoozeDuration');
      if (savedSnooze) {
          setSnoozeDuration(parseInt(savedSnooze, 10));
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('sleepHistory', JSON.stringify(history));
      localStorage.setItem('sleepGoal', sleepGoal.toString());
      localStorage.setItem('selectedAlarm', selectedAlarm);
      localStorage.setItem('snoozeDuration', snoozeDuration.toString());
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [history, sleepGoal, selectedAlarm, snoozeDuration]);

  const playAlarm = () => {
    if (alarmIntervalRef.current) return;

    const playSound = () => {
        if (typeof window === 'undefined') return;

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioCtx = audioContextRef.current;
        if (!audioCtx) return;
        // Check if context is suspended (autoplay policies)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

        switch (selectedAlarm) {
            case 'Ascending':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 1);
                gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
                break;
            case 'Digital':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.05);
                oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.15);
                break;
            case 'Beep':
            default:
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(980, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
                break;
        }
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 1);
    };

    playSound();
    alarmIntervalRef.current = window.setInterval(playSound, 1200);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
    }
  };

  const handleStartSleep = () => {
    if (!areSettingsConfirmed) {
        setSettingsReminder('Please confirm your settings before starting.');
        return;
    }
    setSettingsReminder('');
    setIsSleeping(true);
    setStartTime(new Date().toISOString());
  };

  const handleWakeUp = () => {
    if (startTime) {
      const endTime = new Date().toISOString();
      const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
      const newSession: SleepSession = {
        id: new Date().toISOString(),
        startTime,
        endTime,
        duration,
      };
      setHistory((prev) => [...prev, newSession]);
    }
    setIsSleeping(false);
    setStartTime(null);
    setIsAlarmRinging(false);
    stopAlarm();

    if (snoozeTimeoutRef.current) {
        clearTimeout(snoozeTimeoutRef.current);
        snoozeTimeoutRef.current = null;
    }
  };
  
  const handleTriggerAlarm = () => {
    if (notificationsEnabled) {
      setIsAlarmRinging(true);
      playAlarm();
    }
  };

  const handleSnooze = () => {
    stopAlarm();
    setIsAlarmRinging(false);
    
    if (snoozeTimeoutRef.current) {
        clearTimeout(snoozeTimeoutRef.current);
    }
    const snoozeMs = snoozeDuration * 60 * 1000;
    snoozeTimeoutRef.current = window.setTimeout(() => {
        if(isSleeping) {
            handleTriggerAlarm();
        }
    }, snoozeMs);
  };

  const handleConfirmSettings = (newSettings: {goal: number, alarm: string, snooze: number}) => {
    setSleepGoal(newSettings.goal);
    setSelectedAlarm(newSettings.alarm);
    setSnoozeDuration(newSettings.snooze);
    setAreSettingsConfirmed(true);
    setSettingsReminder('');
  };


  const handleGenerateSummary = async () => {
    if (history.length === 0) {
        setSummary("No sleep data available to generate a summary.");
        return;
    }

    setIsGenerating(true);
    setSummary('');

    const formattedHistory = history.slice(-7).map(session => 
      `- Date: ${new Date(session.startTime).toLocaleDateString()}, Duration: ${formatDurationForLog(session.duration)}`
    ).join('\n');
    
    const prompt = `
    Based on the following sleep data for the last 7 sessions, act as a friendly sleep coach.
    The user's sleep goal is ${formatDurationForLog(sleepGoal)}.
    Analyze their sleep patterns, clearly stating if their sleep is 'enough', 'not enough', or 'lacking' based on their goal.
    Offer several specific, actionable suggestions for how to improve their sleep.
    Format the output as markdown with headings and bullet points for readability.

    Sleep Data:
    ${formattedHistory}
    `;

    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text;
      const htmlSummary = await marked.parse(text);
      setSummary(htmlSummary);

    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Sorry, I was unable to generate a summary at this time.');
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans pb-24">
      <main className="container mx-auto p-4 md:p-8">
        {currentPage === 'tracker' && (
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
                {settingsReminder && (
                    <div className="w-full p-3 text-center bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                        {settingsReminder}
                    </div>
                )}
                <SleepTracker
                    isSleeping={isSleeping}
                    startTime={startTime}
                    onStart={handleStartSleep}
                    onConfirmWakeUp={handleWakeUp}
                    onTriggerAlarm={handleTriggerAlarm}
                    onSnooze={handleSnooze}
                    sleepGoal={sleepGoal}
                    isAlarmRinging={isAlarmRinging}
                />
                <NotificationSettings 
                    notificationsEnabled={notificationsEnabled}
                    onToggleNotifications={setNotificationsEnabled}
                    sleepGoal={sleepGoal}
                    selectedAlarm={selectedAlarm}
                    snoozeDuration={snoozeDuration}
                    onConfirmSettings={handleConfirmSettings}
                    onSettingsChange={() => setAreSettingsConfirmed(false)}
                    onGenerateSummary={handleGenerateSummary}
                    isGenerating={isGenerating}
                    summary={summary}
                />
            </div>
        )}

        {currentPage === 'history' && (
            <div className="w-full max-w-4xl mx-auto">
                {history.length > 0 ? (
                    <>
                        <SleepChart history={history} sleepGoal={sleepGoal} />
                        <SleepHistory history={history} sleepGoal={sleepGoal} />
                    </>
                ) : (
                    <div className="text-center text-slate-400 bg-slate-800/50 p-8 rounded-lg mt-8">
                        <h2 className="text-2xl font-semibold text-slate-200 mb-4">No History Yet</h2>
                        <p>Your sleep chart and log will appear here once you've completed a sleep session.</p>
                        <button 
                            onClick={() => setCurrentPage('tracker')}
                            className="mt-6 bg-sky-500 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors"
                        >
                            Start First Session
                        </button>
                    </div>
                )}
            </div>
        )}
      </main>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;