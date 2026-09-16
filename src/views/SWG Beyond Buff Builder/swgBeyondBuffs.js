export const TOTAL_POINTS = 20

export const categories = [
  {
    id: 'attributes',
    label: 'ATTRIBUTES',
    items: [
      { id: 'agility', name: 'Agility', cost: 1, max: 10 },
      { id: 'block-value', name: 'Block Value', cost: 1, max: 10 },
      { id: 'camouflage', name: 'Camouflage', cost: 1, max: 10 },
      { id: 'constitution', name: 'Constitution', cost: 1, max: 10 },
      { id: 'luck', name: 'Luck', cost: 1, max: 10 },
      { id: 'precision', name: 'Precision', cost: 1, max: 10 },
      { id: 'stamina', name: 'Stamina', cost: 1, max: 10 },
      { id: 'strength', name: 'Strength', cost: 1, max: 10 },
    ],
  },
  {
    id: 'combat',
    label: 'COMBAT',
    items: [
      { id: 'action-cost-reduction', name: 'Action Cost Reduction', cost: 5, max: 1 },
      { id: 'block-chance', name: 'Block Chance', cost: 5, max: 1 },
      { id: 'critical-hit', name: 'Critical Hit', cost: 5, max: 1 },
      { id: 'critical-hit-reduction', name: 'Critical Hit Reduction', cost: 5, max: 1 },
      { id: 'evasion-chance', name: 'Evasion Chance', cost: 5, max: 1 },
      { id: 'glancing-blow', name: 'Glancing Blow', cost: 5, max: 1 },
      { id: 'punishing-blow-reduction', name: 'Punishing Blow Reduction', cost: 5, max: 1 },
      { id: 'strikethrough-chance', name: 'Strikethrough Chance', cost: 5, max: 1 },
    ],
  },
  {
    id: 'miscellaneous',
    label: 'MISCELLANEOUS',
    items: [
      { id: 'creature-harvesting', name: 'Creature Harvesting', cost: 2, max: 5 },
      { id: 'detect-camouflage', name: 'Detect Camouflage', cost: 2, max: 5 },
      { id: 'flush-with-success', name: 'Flush With Success', cost: 2, max: 5 },
      { id: 'harvest-faire', name: 'Harvest Faire', cost: 2, max: 5 },
      { id: 'healer', name: 'Healer', cost: 2, max: 5 },
      { id: 'resilience', name: 'Resilience', cost: 2, max: 5 },
      { id: 'go-with-the-flow', name: 'Go With The Flow', cost: 2, max: 5 },
      { id: 'second-chance', name: 'Second Chance', cost: 2, max: 5 },
    ],
  },
  {
    id: 'resistances',
    label: 'RESISTANCES',
    items: [
      { id: 'elemental-protection', name: 'Elemental Protection', cost: 1, max: 5 },
      { id: 'energy', name: 'Energy', cost: 1, max: 5 },
      { id: 'kinetic', name: 'Kinetic', cost: 1, max: 5 },
    ],
  },
  {
    id: 'trade',
    label: 'TRADE',
    items: [
      { id: 'crafting-assembly', name: 'Crafting Assembly', cost: 2, max: 5 },
      { id: 'amazing-success', name: 'Amazing Success', cost: 5, max: 2 },
      { id: 'hand-sampling', name: 'Hand Sampling', cost: 2, max: 5 },
    ],
  },
]

export const allBuffs = categories.flatMap(category => category.items)
