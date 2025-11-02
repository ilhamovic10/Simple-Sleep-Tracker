import React, { useState, useEffect } from 'react';

interface NotificationSettingsProps {
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  sleepGoal: number; // in milliseconds
  selectedAlarm: string;
  snoozeDuration: number;
  onConfirmSettings: (settings: {goal: number, alarm: string, snooze: number}) => void;
  onSettingsChange: () => void;
  onGenerateSummary: () => void;
  isGenerating: boolean;
  summary: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notificationsEnabled,
  onToggleNotifications,
  sleepGoal,
  selectedAlarm,
  snoozeDuration,
  onConfirmSettings,
  onSettingsChange,
  onGenerateSummary,
  isGenerating,
  summary
}) => {
    // Local state for pending changes
    const [localHours, setLocalHours] = useState(0);
    const [localMinutes, setLocalMinutes] = useState(0);
    const [localSeconds, setLocalSeconds] = useState(0);
    const [localAlarm, setLocalAlarm] = useState(selectedAlarm);
    const [localSnooze, setLocalSnooze] = useState(snoozeDuration);
    const [isPristine, setIsPristine] = useState(true);

    useEffect(() => {
        const h = Math.floor(sleepGoal / (60 * 60 * 1000));
        const m = Math.floor((sleepGoal % (60 * 60 * 1000)) / (60 * 1000));
        const s = Math.floor((sleepGoal % (60 * 1000)) / 1000);
        setLocalHours(h);
        setLocalMinutes(m);
        setLocalSeconds(s);
        setLocalAlarm(selectedAlarm);
        setLocalSnooze(snoozeDuration);
        setIsPristine(true);
    }, [sleepGoal, selectedAlarm, snoozeDuration]);


    const handleSettingChange = () => {
        if(isPristine) {
            setIsPristine(false);
            onSettingsChange();
        }
    };

    const handleConfirm = () => {
        const newGoalMs = (localHours * 60 * 60 * 1000) + (localMinutes * 60 * 1000) + (localSeconds * 1000);
        onConfirmSettings({
            goal: newGoalMs,
            alarm: localAlarm,
            snooze: localSnooze,
        });
    };

  return (
    <div className="w-full mt-8 bg-slate-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-slate-200 mb-4 text-center">Settings & Insights</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <label htmlFor="notifications" className="text-slate-300">Enable Alarm Sound</label>
            <button
            id="notifications"
            onClick={() => onToggleNotifications(!notificationsEnabled)}
            className={`${
                notificationsEnabled ? 'bg-indigo-500' : 'bg-slate-600'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
            <span
                className={`${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
            </button>
        </div>

        <div className="flex items-center justify-between">
            <label htmlFor="sleep-goal-hours" className="text-slate-300">Sleep Goal</label>
            <div className="flex items-center space-x-1">
                <input
                    id="sleep-goal-hours"
                    type="number"
                    value={localHours}
                    onChange={(e) => { setLocalHours(parseInt(e.target.value, 10) || 0); handleSettingChange(); }}
                    min="0"
                    max="23"
                    className="w-14 bg-slate-700 text-white p-1 rounded-md border border-slate-600 text-center"
                    />
                <span className="text-slate-400 text-sm font-medium">h</span>
                <input
                    id="sleep-goal-minutes"
                    type="number"
                    value={localMinutes}
                    onChange={(e) => { setLocalMinutes(parseInt(e.target.value, 10) || 0); handleSettingChange(); }}
                    min="0"
                    max="59"
                    className="w-14 bg-slate-700 text-white p-1 rounded-md border border-slate-600 text-center"
                />
                <span className="text-slate-400 text-sm font-medium">m</span>
                <input
                    id="sleep-goal-seconds"
                    type="number"
                    value={localSeconds}
                    onChange={(e) => { setLocalSeconds(parseInt(e.target.value, 10) || 0); handleSettingChange(); }}
                    min="0"
                    max="59"
                    className="w-14 bg-slate-700 text-white p-1 rounded-md border border-slate-600 text-center"
                />
                <span className="text-slate-400 text-sm font-medium">s</span>
            </div>
        </div>

        <div className="flex items-center justify-between">
            <label htmlFor="alarm-sound" className="text-slate-300">Alarm Sound</label>
            <select
            id="alarm-sound"
            value={localAlarm}
            onChange={(e) => { setLocalAlarm(e.target.value); handleSettingChange(); }}
            className="w-32 bg-slate-700 text-white py-1 pl-2 pr-8 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
            <option value="Beep">Beep</option>
            <option value="Ascending">Ascending</option>
            <option value="Digital">Digital</option>
            </select>
        </div>

        <div className="flex items-center justify-between">
            <label htmlFor="snooze-duration" className="text-slate-300">Snooze Duration</label>
            <select
            id="snooze-duration"
            value={localSnooze}
            onChange={(e) => { setLocalSnooze(parseInt(e.target.value, 10)); handleSettingChange(); }}
            className="w-32 bg-slate-700 text-white py-1 pl-2 pr-8 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            </select>
        </div>
      </div>
      
      {!isPristine && (
        <div className="mt-6">
            <button 
                onClick={handleConfirm}
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
                Confirm Settings
            </button>
        </div>
      )}

      <div className="border-t border-slate-700 pt-4 mt-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-2 text-center">Sleep Summary</h3>
          <button 
            onClick={onGenerateSummary}
            disabled={isGenerating}
            className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Weekly Summary'}
          </button>
          {summary && (
             <div className="mt-4 p-4 bg-slate-700 rounded-md prose prose-invert prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
             </div>
          )}
      </div>

    </div>
  );
};

export default NotificationSettings;