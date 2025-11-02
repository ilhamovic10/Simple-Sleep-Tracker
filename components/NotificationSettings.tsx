import React from 'react';

interface NotificationSettingsProps {
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  sleepGoal: number; // in milliseconds
  onSleepGoalChange: (ms: number) => void;
  selectedAlarm: string;
  onAlarmChange: (soundName: string) => void;
  snoozeDuration: number;
  onSnoozeDurationChange: (minutes: number) => void;
  onGenerateSummary: () => void;
  isGenerating: boolean;
  summary: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notificationsEnabled,
  onToggleNotifications,
  sleepGoal,
  onSleepGoalChange,
  selectedAlarm,
  onAlarmChange,
  snoozeDuration,
  onSnoozeDurationChange,
  onGenerateSummary,
  isGenerating,
  summary
}) => {
    const hours = Math.floor(sleepGoal / (60 * 60 * 1000));
    const minutes = Math.floor((sleepGoal % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((sleepGoal % (60 * 1000)) / 1000);

    const handleGoalChange = (h: number, m: number, s: number) => {
        const newGoalMs = (h * 60 * 60 * 1000) + (m * 60 * 1000) + (s * 1000);
        onSleepGoalChange(newGoalMs);
    };

  return (
    <div className="w-full mt-8 bg-slate-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-slate-200 mb-4 text-center">Settings & Insights</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <label htmlFor="notifications" className="text-slate-300">Enable Notifications</label>
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
                    value={hours}
                    onChange={(e) => handleGoalChange(parseInt(e.target.value, 10) || 0, minutes, seconds)}
                    min="0"
                    max="23"
                    className="w-14 bg-slate-700 text-white p-1 rounded-md border border-slate-600 text-center"
                    />
                <span className="text-slate-400 text-sm font-medium">h</span>
                <input
                    id="sleep-goal-minutes"
                    type="number"
                    value={minutes}
                    onChange={(e) => handleGoalChange(hours, parseInt(e.target.value, 10) || 0, seconds)}
                    min="0"
                    max="59"
                    className="w-14 bg-slate-700 text-white p-1 rounded-md border border-slate-600 text-center"
                />
                <span className="text-slate-400 text-sm font-medium">m</span>
                <input
                    id="sleep-goal-seconds"
                    type="number"
                    value={seconds}
                    onChange={(e) => handleGoalChange(hours, minutes, parseInt(e.target.value, 10) || 0)}
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
            value={selectedAlarm}
            onChange={(e) => onAlarmChange(e.target.value)}
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
            value={snoozeDuration}
            onChange={(e) => onSnoozeDurationChange(parseInt(e.target.value, 10))}
            className="w-32 bg-slate-700 text-white py-1 pl-2 pr-8 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            </select>
        </div>
      </div>


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