import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Label } from 'recharts';
import type { SleepSession } from '../types';
import { msToHours, formatDate } from '../utils/format';

interface SleepChartProps {
  history: SleepSession[];
  sleepGoal: number; // in milliseconds
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 p-2 border border-slate-600 rounded-md shadow-lg">
          <p className="text-slate-200 label">{`${label}`}</p>
          <p className="text-sky-400 intro">{`Sleep: ${payload[0].value.toFixed(2)} hours`}</p>
        </div>
      );
    }
  
    return null;
};


const SleepChart: React.FC<SleepChartProps> = ({ history, sleepGoal }) => {
  const processData = (sessions: SleepSession[]) => {
    if (!sessions || sessions.length === 0) {
      return [];
    }
    const last7Days = sessions.slice(-7);
    return last7Days.map(session => ({
      date: formatDate(session.startTime),
      hours: msToHours(session.duration),
    }));
  };

  const chartData = processData(history);

  if (chartData.length === 0) {
      return null;
  }
  
  const goalInHours = msToHours(sleepGoal);
  const yAxisMax = Math.ceil(Math.max(...chartData.map(d => d.hours), goalInHours) + 1);

  return (
    <div className="w-full h-64 mt-8">
      <h2 className="text-xl font-semibold text-slate-200 mb-4 text-center">Last 7 Sessions</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8' }} stroke="#64748b" />
          <YAxis unit="h" tick={{ fill: '#94a3b8' }} stroke="#64748b" domain={[0, yAxisMax]} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }} />
          <ReferenceLine y={goalInHours} stroke="#f59e0b" strokeDasharray="4 4">
            <Label value="Goal" position="right" fill="#f59e0b" fontSize={12} offset={10} />
          </ReferenceLine>
          <Bar dataKey="hours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepChart;