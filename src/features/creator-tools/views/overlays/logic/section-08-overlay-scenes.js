import { createSceneSnapshot } from '../../../overlays/overlaySnapshots.js'

export function useOverlayScenes({ project, scene, notice, commit }) {
  function selectScene(id) {
    project.selectedSceneId = id
    project.selectedWidgetId = ''
    notice.value = ''
  }

  function sceneAction(action) {
    if (action === 'add') {
      const base = createSceneSnapshot(scene.value)
      base.id = `scene-custom-${project.scenes.length + 1}`
      base.name = `Custom Scene ${project.scenes.length - 4}`
      base.required = false
      base.isDefault = false
      base.widgets = []
      project.scenes.push(base)
      selectScene(base.id)
      commit('New demo scene added')
    }
    if (action === 'duplicate') {
      const copy = createSceneSnapshot(scene.value)
      copy.id = `${scene.value.id}-copy-${project.scenes.length}`
      copy.name = `${scene.value.name} Copy`
      copy.required = false
      copy.isDefault = false
      copy.widgets = copy.widgets.map((widget, index) => ({ ...widget, id: `${widget.id}-copy-${index}` }))
      project.scenes.push(copy)
      selectScene(copy.id)
      commit('Scene duplicated')
    }
    if (action === 'rename') {
      const name = prompt('Rename demo scene', scene.value.name)
      if (name?.trim()) { scene.value.name = name.trim(); commit('Scene renamed') }
    }
    if (action === 'default') {
      project.scenes.forEach(item => { item.isDefault = item.id === scene.value.id })
      commit('Default scene updated')
    }
    if (action === 'delete') {
      if (scene.value.required) {
        notice.value = 'Starter scenes are protected. Duplicate one to create a removable scene.'
      } else if (confirm(`Delete ${scene.value.name}? Undo remains available.`)) {
        const index = project.scenes.findIndex(item => item.id === scene.value.id)
        project.scenes.splice(index, 1)
        selectScene(project.scenes[Math.max(0, index - 1)].id)
        commit('Custom scene deleted')
      }
    }
  }

  return { selectScene, sceneAction }
}
