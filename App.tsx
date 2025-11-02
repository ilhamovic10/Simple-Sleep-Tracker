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

  // AI Summary
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');

  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

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
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('sleepHistory', JSON.stringify(history));
      localStorage.setItem('sleepGoal', sleepGoal.toString());
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [history, sleepGoal]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      alarmAudioRef.current = new Audio(`/sounds/${selectedAlarm}.mp3`);
      alarmAudioRef.current.loop = true;
    }
  }, [selectedAlarm]);

  const playAlarm = () => {
    if (alarmAudioRef.current) {
        alarmAudioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  const stopAlarm = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  };

  const handleStartSleep = () => {
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
    
    console.log(`Snoozing for ${snoozeDuration} minutes.`);
    // For simplicity in this example, snoozing just stops the alarm and logs the user as awake.
    handleWakeUp();
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
    Based on the following sleep data for the last 7 sessions, provide a friendly and insightful summary of the user's sleep patterns. 
    The user's sleep goal is ${formatDurationForLog(sleepGoal)}.
    Mention consistency, whether they are meeting their goal, and offer one simple, actionable tip for improvement.
    Format the output as markdown.

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
                    onSleepGoalChange={setSleepGoal}
                    selectedAlarm={selectedAlarm}
                    onAlarmChange={setSelectedAlarm}
                    snoozeDuration={snoozeDuration}
                    onSnoozeDurationChange={setSnoozeDuration}
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