import { DEMO_SOURCE_PLACEHOLDER } from '../../../overlays/overlayBuilderDemoState.js'

export function useBrowserSources({ notice, previewMode }) {
  function copyPlaceholder() {
    navigator.clipboard?.writeText(DEMO_SOURCE_PLACEHOLDER).catch(() => {})
    notice.value = 'Copied demo placeholder · No live source exists yet'
  }
  function openBrowserSourcePreview() { previewMode.value = true }
  return { copyPlaceholder, openBrowserSourcePreview }
}
