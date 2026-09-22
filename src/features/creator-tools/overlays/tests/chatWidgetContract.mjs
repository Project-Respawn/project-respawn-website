import { computed, reactive } from 'vue'
import { declaration, evaluate } from '../../../../../scripts/test-support/source-contracts.mjs'
import { normalizeCreatorChatConfig } from '../../views/chat/chat.config.js'

export function widgetChat(source, runtimeConfig, previewConfig, settings = {}) {
  const props = reactive({ runtimeConfig, widget: { settings } })
  const preview = reactive({ config: { value: previewConfig } })
  const legacyConfig = evaluate(declaration(source, 'legacyConfig'), { props })
  const chat = evaluate(declaration(source, 'chat'), { computed, props, preview, legacyConfig, normalizeCreatorChatConfig })
  return { chat, props, preview }
}
