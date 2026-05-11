<template>
	<div v-if="!isEmbedded" class="ui-floating-settings">
		<ElDropdown trigger="click" placement="top-end" @command="handleLanguageCommand">
			<ElButton circle class="main-fab" type="primary">
				<ElIcon :size="20"><Setting /></ElIcon>
			</ElButton>
			<template #dropdown>
				<ElDropdownMenu class="settings-dropdown">
					<!-- Theme Section -->
					<div class="dropdown-section">
						<div class="section-title">Theme</div>
						<ElDropdownItem class="theme-toggle-item" @click.stop="toggleTheme">
							<div class="theme-content">
								<ElIcon v-if="isDark"><Moon /></ElIcon>
								<ElIcon v-else><Sunny /></ElIcon>
								<span>{{ isDark ? 'Dark Mode' : 'Light Mode' }}</span>
							</div>
						</ElDropdownItem>
					</div>

					<ElDivider class="section-divider" />

					<!-- Theme Builder Section -->
					<div class="dropdown-section theme-builder-dropdown-section">
						<div class="section-title">Theme Builder</div>
						<div class="theme-builder-container" @click.stop>
							<UiThemeBuilder />
						</div>
					</div>

					<ElDivider class="section-divider" />

					<!-- Language Section -->
					<div class="dropdown-section">
						<div class="section-title">Language</div>
						<ElDropdownItem
							v-for="lang in availableLanguages"
							:key="lang.code"
							:command="lang.code"
							:disabled="lang.code === currentLocale"
							:class="{ 'is-active': lang.code === currentLocale }"
						>
							<div class="lang-item">
								<span>{{ lang.name }}</span>
								<ElIcon v-if="lang.code === currentLocale" class="check-icon"><Check /></ElIcon>
							</div>
						</ElDropdownItem>
					</div>
				</ElDropdownMenu>
			</template>
		</ElDropdown>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useI18n } from '@admin-panel/i18n'
import { Check, Moon, Setting, Sunny } from '@element-plus/icons-vue'
import { ElButton, ElDivider, ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon } from 'element-plus'

import { UiThemeBuilder } from '../../ui-theme-builder'
import { useTheme } from '../../ui-theme-switcher/lib/composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const { currentLocale, availableLanguages, setLocale, loadLanguages } = useI18n()

const isEmbedded = ref(false)

const handleLanguageCommand = (lang: string) => {
	setLocale(lang)

	window.location.reload()
}

onMounted(async () => {
	isEmbedded.value = !!document.querySelector('.main-layout')

	if (!isEmbedded.value && availableLanguages.value.length === 0) {
		await loadLanguages()
	}
})
</script>

<style lang="scss" scoped>
.ui-floating-settings {
	right: 24px;
	bottom: 24px;
	position: fixed;
	z-index: 9999;
}

.main-fab {
	width: 56px !important;
	height: 56px;
	display: flex !important;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--gp-glass-border) !important;
	border-radius: 50% !important;
	box-shadow: 0 8px 24px rgb(0, 0, 0, 0.15);
	color: var(--gp-text-main) !important;
	background: var(--gp-bg-glass) !important;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	padding: 0 !important;
	backdrop-filter: blur(8px);

	.el-icon {
		margin: 0 !important;
	}

	&:hover {
		border-color: var(--gp-primary) !important;
		box-shadow: 0 12px 32px rgb(0, 0, 0, 0.25);
		background: var(--gp-bg-glass-hover) !important;
		transform: scale(1.05);
	}
}

.settings-dropdown {
	width: 280px;
	border: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
	padding: 8px 0;
	backdrop-filter: blur(12px);
}

.theme-builder-container {
	padding: 0 12px 8px;
}

.dropdown-section {
	padding: 0 8px;
}

.section-title {
	font-weight: 700;
	font-size: 11px;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--gp-text-muted);
	padding: 8px 12px 4px;
}

.theme-content,
.lang-item {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 10px;
}

.check-icon {
	color: var(--gp-primary);
	margin-left: auto;
}

.section-divider {
	border-top: 1px solid var(--gp-glass-border);
	margin: 8px 0;
}

:deep(.el-dropdown-menu__item) {
	border-radius: var(--gp-radius-sm);
	margin: 2px 8px;

	&:hover {
		color: var(--gp-primary);
		background: var(--gp-primary-light-9);
	}

	&.is-active {
		font-weight: 600;
		color: var(--gp-primary);
	}
}
</style>
