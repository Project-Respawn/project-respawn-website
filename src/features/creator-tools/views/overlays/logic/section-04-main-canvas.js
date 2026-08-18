import { ref } from 'vue'

export function useMainCanvas({ selectWidget, changeWidget }) {
  const zoomMode = ref('fit')
  function setZoomMode(mode) { zoomMode.value = mode }
  return { zoomMode, setZoomMode, selectWidget, changeWidget }
}
