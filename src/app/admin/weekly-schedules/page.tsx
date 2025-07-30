'use client';

import { useEffect, useState } from 'react';
import { WeeklyScheduleEntry } from '@/lib/data/weeklySchedules';
import WeeklyScheduleForm from '@/components/features/admin/weekly-schedules/WeeklyScheduleForm';

const AdminWeeklySchedulesPage = () => {
  const [schedules, setSchedules] = useState<WeeklyScheduleEntry[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<WeeklyScheduleEntry | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const res = await fetch('/api/admin/weekly-schedules');
    const data = await res.json();
    setSchedules(data);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      await fetch('/api/admin/weekly-schedules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchSchedules();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-200">Manage Weekly Schedules</h1>
      <WeeklyScheduleForm
        schedule={editingSchedule}
        onSuccess={() => {
          setEditingSchedule(null);
          fetchSchedules();
        }}
      />
      <div className="mt-10 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Existing Schedules</h2>
        <table className="min-w-full bg-gray-800 border border-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Day(s)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Time Slot</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Description</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {schedules.map(schedule => (
              <tr key={schedule.id} className="hover:bg-gray-700/50">
                <td className="px-4 py-2 text-sm text-gray-300">{schedule.name}</td>
                <td className="px-4 py-2 text-sm text-gray-300">{Array.isArray(schedule.day_of_week) ? schedule.day_of_week.join(', ') : ''}</td>
                <td className="px-4 py-2 text-sm text-gray-300">{schedule.time_slot}</td>
                <td className="px-4 py-2 text-sm text-gray-300">{schedule.event_desc}</td>
                <td className="px-4 py-2 text-sm text-gray-300 space-x-2">
                  <button 
                    onClick={() => setEditingSchedule(schedule)}
                    className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(schedule.id)}
                    className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWeeklySchedulesPage;
