export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};
