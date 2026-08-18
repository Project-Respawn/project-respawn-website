export function useGamePreview({ scene, notice, commit, registerCleanup }) {
  let customUrl = ''

  function changePreview(next) {
    scene.value.preview = next
    commit('Game preview changed · Overlay output remains transparent')
  }

  function uploadPreview(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5_000_000) {
      notice.value = 'Choose an image smaller than 5 MB.'
      return
    }
    if (customUrl) URL.revokeObjectURL(customUrl)
    customUrl = URL.createObjectURL(file)
    scene.value.preview = {
      ...scene.value.preview,
      backgroundType: 'custom', customImageUrl: customUrl,
      brightness: 'mixed', motion: 'low',
    }
    commit('Session-only preview loaded · Not included in output')
  }

  registerCleanup(() => { if (customUrl) URL.revokeObjectURL(customUrl) })
  return { changePreview, uploadPreview }
}
