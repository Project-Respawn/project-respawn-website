export const CREATOR_CATEGORY_LIMIT = 5;

export const creatorCategories = Object.freeze([
  { key: 'gaming', label: 'Gaming', icon: 'gamepad', accent: '#a78bfa', accentRgb: '167, 139, 250' },
  { key: 'variety', label: 'Variety', icon: 'sparkles', accent: '#c084fc', accentRgb: '192, 132, 252' },
  { key: 'just-chatting', label: 'Just Chatting', icon: 'message-circle', accent: '#38bdf8', accentRgb: '56, 189, 248' },
  { key: 'competitive', label: 'Competitive', icon: 'trophy', accent: '#facc15', accentRgb: '250, 204, 21' },
  { key: 'esports', label: 'Esports', icon: 'medal', accent: '#fb923c', accentRgb: '251, 146, 60' },
  { key: 'educational', label: 'Educational', icon: 'graduation-cap', accent: '#818cf8', accentRgb: '129, 140, 248' },
  { key: 'cosy', label: 'Cosy', icon: 'coffee', accent: '#fbbf24', accentRgb: '251, 191, 36' },
  { key: 'horror', label: 'Horror', icon: 'ghost', accent: '#e11d48', accentRgb: '225, 29, 72' },
  { key: 'speedrunning', label: 'Speedrunning', icon: 'timer', accent: '#a3e635', accentRgb: '163, 230, 53' },
  { key: 'community', label: 'Community', icon: 'users', accent: '#22d3ee', accentRgb: '34, 211, 238' },
  { key: 'fitness', label: 'Fitness', icon: 'dumbbell', accent: '#4ade80', accentRgb: '74, 222, 128' },
  { key: 'wellbeing', label: 'Wellbeing', icon: 'heart', accent: '#fb7185', accentRgb: '251, 113, 133' },
  { key: 'creative', label: 'Creative', icon: 'palette', accent: '#e879f9', accentRgb: '232, 121, 249' },
  { key: 'music', label: 'Music', icon: 'music', accent: '#f472b6', accentRgb: '244, 114, 182' },
  { key: 'roleplay', label: 'Roleplay', icon: 'masks', accent: '#2dd4bf', accentRgb: '45, 212, 191' },
  { key: 'adult-creator', label: 'Adult Creator', icon: '18-plus', accent: '#f87171', accentRgb: '248, 113, 113' }
]);

export function getCreatorCategory(key) {
  return creatorCategories.find((category) => category.key === key);
}
