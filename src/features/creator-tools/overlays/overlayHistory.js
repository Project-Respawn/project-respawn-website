export function createHistory(initialState, limit = 40) {
  let past = []; let present = structuredClone(initialState); let future = []
  return {
    get value() { return structuredClone(present) },
    get canUndo() { return past.length > 0 },
    get canRedo() { return future.length > 0 },
    commit(next) { past.push(present); if (past.length > limit) past.shift(); present = structuredClone(next); future = []; return this.value },
    replace(next) { present = structuredClone(next); return this.value },
    undo() { if (!past.length) return this.value; future.unshift(present); present = past.pop(); return this.value },
    redo() { if (!future.length) return this.value; past.push(present); present = future.shift(); return this.value },
  }
}
