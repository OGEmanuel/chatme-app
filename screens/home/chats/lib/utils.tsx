export const formatTimeToISO = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toISOString();
};
// 2026-11-07T19:47:00.000Z (depending on timezone)

export const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
