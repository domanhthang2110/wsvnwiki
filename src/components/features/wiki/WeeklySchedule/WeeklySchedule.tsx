import { getWeeklySchedule, WeeklyScheduleEntry } from '@/lib/data/weeklySchedules';
import styles from './WeeklySchedule.module.css';

const WeeklySchedule = async () => {
  const scheduleData = await getWeeklySchedule();

  if (!scheduleData || scheduleData.length === 0) {
    return <p>No schedule available.</p>;
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const allTimeSlots = scheduleData.flatMap(item => item.time_slot?.split(',').map(t => t.trim()) || []);
  const timeSlots = [...new Set(allTimeSlots)].sort();

  const mergedCells: { [key: string]: WeeklyScheduleEntry & { span: number } } = {};

  timeSlots.forEach(slot => {
    const eventsInSlot = scheduleData.filter(item => 
      item.time_slot?.split(',').map(t => t.trim()).includes(slot)
    );
    if (eventsInSlot.length === 1 && Array.isArray(eventsInSlot[0].day_of_week) && eventsInSlot[0].day_of_week.length === 7) {
      mergedCells[slot] = { ...eventsInSlot[0], span: 7 };
    }
  });

  return (
    <div className={styles.scheduleContainer}>
      <h2 className={styles.title}>Weekly Schedule</h2>
      <table className={styles.scheduleTable}>
        <thead>
          <tr>
            <th>Day</th>
            {timeSlots.map(slot => <th key={slot}>{slot}</th>)}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => (
            <tr key={day}>
              <td>{day}</td>
              {timeSlots.map(slot => {
                if (mergedCells[slot] && dayIndex > 0) {
                  return null; // This cell is merged
                }
                if (mergedCells[slot] && dayIndex === 0) {
                  const entry = mergedCells[slot];
                  return (
                    <td key={slot} rowSpan={entry.span} title={entry.event_desc || ''}>
                      {entry.name}
                    </td>
                  );
                }

                const entry = scheduleData.find(item => 
                  Array.isArray(item.day_of_week) && 
                  (item.day_of_week as string[]).includes(day) && 
                  item.time_slot?.split(',').map(t => t.trim()).includes(slot)
                );
                return (
                  <td key={slot} title={entry ? entry.event_desc || '' : ''}>
                    {entry ? entry.name : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklySchedule;
