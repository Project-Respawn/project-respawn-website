export const TIMEZONE_GROUPS = [
  { label: 'United Kingdom and Europe', zones: [
    ['Europe/London', 'UK / London'], ['Europe/Dublin', 'Ireland / Dublin'], ['Europe/Paris', 'Central European Time'],
    ['Europe/Helsinki', 'Eastern European Time'], ['Europe/Athens', 'Greece / Athens'], ['Europe/Istanbul', 'Türkiye / Istanbul'],
  ] },
  { label: 'North America', zones: [
    ['America/St_Johns', 'Newfoundland Time'], ['America/Halifax', 'Atlantic Time'], ['America/New_York', 'Eastern Time'],
    ['America/Chicago', 'Central Time'], ['America/Denver', 'Mountain Time'], ['America/Phoenix', 'Arizona Time'],
    ['America/Los_Angeles', 'Pacific Time'], ['America/Anchorage', 'Alaska Time'], ['Pacific/Honolulu', 'Hawaii Time'],
  ] },
  { label: 'Latin America', zones: [
    ['America/Mexico_City', 'Mexico City'], ['America/Bogota', 'Colombia / Bogotá'], ['America/Lima', 'Peru / Lima'],
    ['America/Santiago', 'Chile / Santiago'], ['America/Sao_Paulo', 'Brazil / São Paulo'], ['America/Argentina/Buenos_Aires', 'Argentina / Buenos Aires'],
  ] },
  { label: 'Africa and Middle East', zones: [
    ['Africa/Casablanca', 'Morocco / Casablanca'], ['Africa/Lagos', 'West Africa Time'], ['Africa/Johannesburg', 'South Africa Time'],
    ['Africa/Nairobi', 'East Africa Time'], ['Asia/Jerusalem', 'Israel / Jerusalem'], ['Asia/Dubai', 'Gulf Standard Time'],
  ] },
  { label: 'Asia', zones: [
    ['Asia/Karachi', 'Pakistan Standard Time'], ['Asia/Kolkata', 'India Standard Time'], ['Asia/Dhaka', 'Bangladesh Standard Time'],
    ['Asia/Bangkok', 'Indochina Time'], ['Asia/Singapore', 'Singapore Time'], ['Asia/Shanghai', 'China Standard Time'],
    ['Asia/Hong_Kong', 'Hong Kong Time'], ['Asia/Seoul', 'Korea Standard Time'], ['Asia/Tokyo', 'Japan Standard Time'],
  ] },
  { label: 'Australia and Pacific', zones: [
    ['Australia/Perth', 'Australia Western Time'], ['Australia/Adelaide', 'Australia Central Time'], ['Australia/Sydney', 'Australia Eastern Time'],
    ['Pacific/Auckland', 'New Zealand Time'], ['Pacific/Fiji', 'Fiji Time'],
  ] },
  { label: 'Universal', zones: [['UTC', 'Coordinated Universal Time']] },
];

export const KNOWN_TIMEZONE_IDS = new Set(TIMEZONE_GROUPS.flatMap((group) => group.zones.map(([id]) => id)));

export function detectBrowserTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; }
}

export function formatCurrentUtcOffset(timeZone, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone, timeZoneName: 'longOffset' }).formatToParts(date);
    const value = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT';
    return value
      .replace(/^GMT([+-])0(\d)(?=:|$)/, 'GMT$1$2')
      .replace(/^GMT([+-])(\d{1,2}):00$/, 'GMT$1$2');
  } catch { return ''; }
}
