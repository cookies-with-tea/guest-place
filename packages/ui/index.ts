import { i18nPlugin, UiTranslation } from '@admin-panel/i18n'

import ContentFormGenerator from './src/components/content'
import UiAreaChart from './src/components/ui-area-chart'
import UiAuthGuard from './src/components/ui-auth-guard'
import UiButton from './src/components/ui-button'
import UiDonutProgress from './src/components/ui-donut-progress'
import UiErrorBoundary from './src/components/ui-error-boundary/ui/UiErrorBoundary.vue'
import UiFilterBar from './src/components/ui-filter-bar'
import UiGlassCard from './src/components/ui-glass-card'
import UiIcon from './src/components/ui-icon'
import UiInfoButton from './src/components/ui-info-button'
import UiInput from './src/components/ui-input'
import UiMediaPicker from './src/components/ui-media-picker'
import UiMfeFallback from './src/components/ui-mfe-fallback/ui/UiMfeFallback.vue'
import UiModal from './src/components/ui-modal'
import UiRankedList from './src/components/ui-ranked-list'
import UiRichTextField from './src/components/ui-rich-text-field'
import UiSelect from './src/components/ui-select'
import UiSeoEditor from './src/components/ui-seo-editor'
import UiSortableHeader from './src/components/ui-sortable-header'
import UiSparkline from './src/components/ui-sparkline'
import UiStatCard from './src/components/ui-stat-card'
import UiTable from './src/components/ui-table'
import UiTableColumn from './src/components/ui-table-column'
import { useResolvedColor, useResolvedColors } from './src/lib/resolveCssColor'
import { initUiStyles } from './src/styles-loader'
import UiAuthWidget from './src/widgets/ui-auth-widget'
import UiFloatingSettings from './src/widgets/ui-floating-settings/ui/UiFloatingSettings.vue'
import UiLanguageSwitcher from './src/widgets/ui-language-switcher/UiLanguageSwitcher.vue'
import UiNotificationBell from './src/widgets/ui-notification-bell'
import UiSidebar from './src/widgets/ui-sidebar'
import { useSidebar } from './src/widgets/ui-sidebar'
import { UiThemeBuilder, useThemeBuilder } from './src/widgets/ui-theme-builder'
import UiThemeSwitcher from './src/widgets/ui-theme-switcher'
import { useTheme } from './src/widgets/ui-theme-switcher'

export {
	ContentFormGenerator,
	i18nPlugin,
	initUiStyles,
	UiAreaChart,
	UiAuthGuard,
	UiAuthWidget,
	UiButton,
	UiDonutProgress,
	UiErrorBoundary,
	UiFilterBar,
	UiFloatingSettings,
	UiGlassCard,
	UiIcon,
	UiInfoButton,
	UiInput,
	UiLanguageSwitcher,
	UiMediaPicker,
	UiMfeFallback,
	UiModal,
	UiNotificationBell,
	UiRankedList,
	UiRichTextField,
	UiSelect,
	UiSeoEditor,
	UiSidebar,
	UiSortableHeader,
	UiSparkline,
	UiStatCard,
	UiTable,
	UiTableColumn,
	UiThemeBuilder,
	UiThemeSwitcher,
	UiTranslation,
	useResolvedColor,
	useResolvedColors,
	useSidebar,
	useTheme,
	useThemeBuilder,
}

export type { RankedListItem } from './src/components/ui-ranked-list'
