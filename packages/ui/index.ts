import { i18nPlugin, UiTranslation } from '@admin-panel/i18n'

import ContentFormGenerator from './src/components/content'
import UiAuthGuard from './src/components/ui-auth-guard'
import UiButton from './src/components/ui-button'
import UiIcon from './src/components/ui-icon'
import UiInput from './src/components/ui-input'
import UiMediaPicker from './src/components/ui-media-picker'
import UiModal from './src/components/ui-modal'
import UiSelect from './src/components/ui-select'
import UiSeoEditor from './src/components/ui-seo-editor'
import UiSortableHeader from './src/components/ui-sortable-header'
import UiTable from './src/components/ui-table'
import UiTableColumn from './src/components/ui-table-column'
import { initUiStyles } from './src/styles-loader'
import UiAuthWidget from './src/widgets/ui-auth-widget'
import UiFloatingSettings from './src/widgets/ui-floating-settings/ui/UiFloatingSettings.vue'
import UiLanguageSwitcher from './src/widgets/ui-language-switcher/UiLanguageSwitcher.vue'
import UiSidebar from './src/widgets/ui-sidebar'
import { useSidebar } from './src/widgets/ui-sidebar'
import { UiThemeBuilder, useThemeBuilder } from './src/widgets/ui-theme-builder'
import UiThemeSwitcher from './src/widgets/ui-theme-switcher'
import { useTheme } from './src/widgets/ui-theme-switcher'

export {
	ContentFormGenerator,
	i18nPlugin,
	initUiStyles,
	UiAuthGuard,
	UiAuthWidget,
	UiButton,
	UiFloatingSettings,
	UiIcon,
	UiInput,
	UiLanguageSwitcher,
	UiMediaPicker,
	UiModal,
	UiSelect,
	UiSeoEditor,
	UiSidebar,
	UiSortableHeader,
	UiTable,
	UiTableColumn,
	UiThemeBuilder,
	UiThemeSwitcher,
	UiTranslation,
	useSidebar,
	useTheme,
	useThemeBuilder,
}
