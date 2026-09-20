<template>
	<section class="quote-banner-block">
		<div class="container">
			<div class="soul-card">
				<div class="soul-header">
					<span class="soul-logo-guest">Guest</span>
					<span class="soul-logo-amp">&</span>
					<span class="soul-logo-place">Place</span>
					<span class="soul-title-text">{{ data.quote || data.title || ' - проект от души :)' }}</span>
				</div>

				<p v-if="data.description" class="soul-lead" v-html="data.description"></p>

				<div class="soul-values-grid">
					<div class="value-item">
						<div class="value-icon-box">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0066CC" stroke-width="2">
								<path d="M9 18h6m-4 4h2M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z"/>
							</svg>
						</div>
						<div class="value-text-wrap">
							<strong v-if="data.val1_title" class="value-title">{{ data.val1_title }}</strong>
							<p class="value-text">
								{{ data.val1_desc || 'постоянный поиск новых решений и внедрение новых технологий' }}
							</p>
						</div>
					</div>

					<div class="value-item">
						<div class="value-icon-box">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0066CC" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
							</svg>
						</div>
						<div class="value-text-wrap">
							<strong v-if="data.val2_title" class="value-title">{{ data.val2_title }}</strong>
							<p class="value-text">
								{{ data.val2_desc || 'мы хотим превзойти ожидания пользователей и свои тоже :)' }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
defineProps<{
	data: {
		quote?: string
		title?: string
		description?: string
		val1_title?: string
		val1_desc?: string
		val2_title?: string
		val2_desc?: string
	}
}>()
</script>

<style scoped>
.quote-banner-block {
	padding: 50px 0;
	background: #FFFFFF;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.soul-card {
	background: linear-gradient(135deg, #F4F8FC 0%, #EBF3FA 100%);
	border-radius: 24px;
	padding: 48px;
	border: 1px solid #D9E8F5;
}

.soul-header {
	font-size: 26px;
	font-weight: 700;
	margin-bottom: 16px;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 4px;
}

.soul-logo-guest {
	color: #333333;
}

.soul-logo-amp {
	color: #0066CC;
}

.soul-logo-place {
	color: #333333;
}

.soul-title-text {
	color: #0066CC;
}

.soul-lead {
	font-size: 16px;
	line-height: 1.6;
	color: #444444;
	max-width: 800px;
	margin-bottom: 36px;
}

.soul-values-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 32px;
}

.value-item {
	display: flex;
	align-items: flex-start;
	gap: 16px;
	background: #FFFFFF;
	padding: 24px;
	border-radius: 16px;
	box-shadow: 0 4px 12px rgba(0, 102, 204, 0.05);
}

.value-icon-box {
	width: 44px;
	height: 44px;
	border-radius: 10px;
	background: #E8F2FA;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.value-title {
	display: block;
	font-size: 15px;
	color: #222222;
	margin-bottom: 4px;
}

.value-text {
	font-size: 14px;
	line-height: 1.5;
	color: #555555;
	margin: 0;
}

@media (max-width: 768px) {
	.soul-card {
		padding: 24px;
	}
	.soul-values-grid {
		grid-template-columns: 1fr;
	}
}
</style>
