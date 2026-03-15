// Format date as "Jan 30, 2026"
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Format time as 12-hour format without seconds
export function formatTime(timeString: string): string {
  // Handle various time formats that might come from database
  const time = new Date(`2000-01-01 ${timeString}`);

  if (isNaN(time.getTime())) {
    return timeString; // Return original if parsing fails
  }

  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
