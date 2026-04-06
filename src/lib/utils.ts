import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  if (!time) return '';
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);

  minutes += minutesToAdd;
  hours += Math.floor(minutes / 60);
  minutes = minutes % 60;
  hours = hours % 24;

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
}

export function calculateStartTimes(items: any[], defaultStartTime: string = '09:00') {
  let currentTime = defaultStartTime;
  
  return items.map((item, index) => {
    if (item.startTime && item.startTime.trim() !== '') {
      currentTime = item.startTime;
    } else if (index === 0) {
      currentTime = defaultStartTime;
    }
    
    const itemWithTime = { ...item, actualStartTime: currentTime };
    currentTime = addMinutesToTime(currentTime, item.duration || 0);
    return itemWithTime;
  });
}
