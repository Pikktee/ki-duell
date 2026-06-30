export function getEuropeBerlinDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

export type LocalDailyStatus = Record<string, {
  status: 'abandoned' | 'completed';
  score?: number;
  correct?: number;
  total?: number;
  durationMs?: number;
}>;

function getDailyStatusKey(): string {
  return `kiduell:dailyStatus:${getEuropeBerlinDate()}`;
}

export function cleanupOldDailyStatuses() {
  const currentKey = getDailyStatusKey();
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('kiduell:dailyStatus:') && key !== currentKey) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function getLocalDailyStatus(): LocalDailyStatus {
  try {
    const data = localStorage.getItem(getDailyStatusKey());
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Failed to parse local daily status");
  }
  return {};
}

export function setLocalDailyStatus(difficulty: string, data: {
  status: 'abandoned' | 'completed';
  score?: number;
  correct?: number;
  total?: number;
  durationMs?: number;
}) {
  const status = getLocalDailyStatus();
  
  if (status[difficulty]?.status === 'completed' && data.status === 'abandoned') {
     // completed has priority
     return;
  }
  
  status[difficulty] = data;
  localStorage.setItem(getDailyStatusKey(), JSON.stringify(status));
}
