// Compatibility adapter for existing overlay modules and external imports.
// The canonical widget catalogue lives in widgets/registry/index.js.
export {
  createWidget,
  getAllWidgets,
  getWidgetByType,
  getWidgetsByCategory,
  getWidgetsByIntegration,
  validateRegistry,
  widgetDefinitions,
  widgetRegistry,
} from '../widgets/registry/index.js'
