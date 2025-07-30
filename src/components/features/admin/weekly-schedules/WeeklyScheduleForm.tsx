'use client';

import { useState, useEffect } from 'react';
import { WeeklyScheduleEntry } from '@/lib/data/weeklySchedules';

interface WeeklyScheduleFormProps {
  schedule: WeeklyScheduleEntry | null;
  onSuccess: () => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyScheduleForm: React.FC<WeeklyScheduleFormProps> = ({ schedule, onSuccess }) => {
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (schedule) {
      setName(schedule.name || '');
      setSelectedDays(Array.isArray(schedule.day_of_week) ? schedule.day_of_week as string[] : []);
      setTimeSlot(schedule.time_slot || '');
      setEventDesc(schedule.event_desc || '');
    } else {
      setName('');
      setSelectedDays([]);
      setTimeSlot('');
      setEventDesc('');
    }
  }, [schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = schedule ? 'PUT' : 'POST';
    const body = JSON.stringify({
      id: schedule?.id,
      name: name,
      day_of_week: selectedDays,
      time_slot: timeSlot,
      event_desc: eventDesc,
    });

    await fetch('/api/admin/weekly-schedules', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const handleDayChange = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="mb-10 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-200">
        {schedule ? 'Edit Schedule' : 'Add New Schedule'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-300">
            Event Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Days of Week:</label>
          <div className="flex flex-wrap gap-4">
            {daysOfWeek.map(day => (
              <label key={day} className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="timeSlot" className="block mb-1 text-sm font-medium text-gray-300">
            Time Slot:
          </label>
          <input
            type="text"
            id="timeSlot"
            value={timeSlot}
            onChange={e => setTimeSlot(e.target.value)}
            required
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>

        <div>
          <label htmlFor="eventDesc" className="block mb-1 text-sm font-medium text-gray-300">
            Description:
          </label>
          <input
            type="text"
            id="eventDesc"
            value={eventDesc}
            onChange={e => setEventDesc(e.target.value)}
            required
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (schedule ? 'Saving...' : 'Creating...') : (schedule ? 'Update' : 'Create')}
          </button>
          {schedule && (
            <button
              type="button"
              onClick={onSuccess}
              className="py-2 px-4 text-gray-300 hover:bg-gray-700 font-medium rounded-lg border border-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WeeklyScheduleForm;
