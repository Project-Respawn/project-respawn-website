import { reactive } from 'vue'

export const sidebarStore = reactive({
  expandedItems: {},
  title: '',
  colourBrand1: '#2563eb',
  colourBrand2: '#38bdf8',
  colourBoxShadow: 'rgba(37, 99, 235, 0.35)',
  
  toggleExpand(itemId) {
    this.expandedItems[itemId] = !this.expandedItems[itemId]
  },
  
  setTitle(title) {
    this.title = title
  },
  
  setColors(brand1, brand2, shadow) {
    this.colourBrand1 = brand1
    this.colourBrand2 = brand2
    this.colourBoxShadow = shadow
  },
  
  reset() {
    this.expandedItems = {}
    this.title = ''
    this.colourBrand1 = '#2563eb'
    this.colourBrand2 = '#38bdf8'
    this.colourBoxShadow = 'rgba(37, 99, 235, 0.35)'
  }
})

export function useSidebar() {
  return sidebarStore
}
