export function isValidDate(value: unknown) { return !Number.isNaN(new Date(value as string).getTime()) }
export function addDays(date: Date, amount: number) { const copy = new Date(date); copy.setUTCDate(copy.getUTCDate() + amount); return copy }
export function addWeeks(date: Date, amount: number) { return addDays(date, amount * 7) }
export function addMonths(date: Date, amount: number) { const copy = new Date(date); copy.setUTCMonth(copy.getUTCMonth() + amount); return copy }
