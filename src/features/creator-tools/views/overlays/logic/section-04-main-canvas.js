import { ref } from 'vue'

export function useMainCanvas({ selectWidget, changeWidget }) {
  const zoomMode = ref('fit')
  function setZoomMode(mode) {
    if (mode === 'fit' || mode === 'actual' || (Number(mode) > 0 && Number.isFinite(Number(mode)))) zoomMode.value = mode
  }
  return { zoomMode, setZoomMode, selectWidget, changeWidget }
}
