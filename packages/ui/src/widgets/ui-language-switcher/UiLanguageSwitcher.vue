<template>
	<div class="language-switcher">
		<div class="language-switcher">
			<ElDropdown trigger="click" @command="handleCommand">
				<div class="current-lang">
					<span class="lang-code">{{ currentLocale.toUpperCase() }}</span>
				</div>
				<template #dropdown>
					<ElDropdownMenu>
						<ElDropdownItem
							v-for="lang in availableLanguages"
							:key="lang.code"
							:command="lang.code"
							:disabled="lang.code === currentLocale"
						>
							{{ lang.name }}
						</ElDropdownItem>
					</ElDropdownMenu>
				</template>
			</ElDropdown>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

import { useI18n } from '@admin-panel/i18n'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'

const { currentLocale, availableLanguages, setLocale, loadLanguages } = useI18n()

const handleCommand = (lang: string) => {
	setLocale(lang)

	// Optionally reload the page to refresh all data from backend with new locale
	window.location.reload()
}

onMounted(() => {
	if (availableLanguages.value.length === 0) {
		loadLanguages()
	}
})
</script>

<style lang="scss" scoped>
.language-switcher {
	display: flex;
	align-items: center;
}

.current-lang {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--gp-glass-border);
	border-radius: var(--gp-radius-sm);
	background: var(--gp-bg-glass);
	transition: all 0.2s ease;
	cursor: pointer;

	&:hover {
		border-color: var(--gp-primary);
		background: var(--gp-bg-glass-hover);
	}
}

.lang-code {
	font-weight: 600;
	font-size: 0.75rem;
	color: var(--gp-text-main);
}
</style>
