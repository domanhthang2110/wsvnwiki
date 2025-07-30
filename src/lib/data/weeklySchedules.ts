import { createClient } from '@/lib/supabase/server';
import { Tables } from '@/types/database.types';

export type WeeklyScheduleEntry = Tables<'weekly_schedules'>;

export async function getWeeklySchedule(): Promise<WeeklyScheduleEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('weekly_schedules')
    .select('*')
    .order('day_of_week', { ascending: true })
    .order('time_slot', { ascending: true });

  if (error) {
    console.error('Error fetching weekly schedule:', error);
    return [];
  }

  return data || [];
}
