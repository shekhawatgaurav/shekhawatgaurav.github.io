export function toDate(value) {
  if (!value) return null;

  if (value?.toDate) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatDate(value) {
  const date = toDate(value);

  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value) {
  const date = toDate(value);

  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatTime(value) {
  const date = toDate(value);

  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getDateKey(value = new Date()) {
  const date = toDate(value) || new Date();
  return date.toISOString().slice(0, 10);
}

export function isToday(value) {
  return getDateKey(value) === getTodayKey();
}