<template>
	<section class="info-banner-block">
		<div class="container">
			<div class="banner-card">
				<div class="banner-content">
					<h2 class="banner-title">{{ data.title || 'Присоединяйтесь к Guest & Place' }}</h2>
					<p v-if="data.description" class="banner-desc">{{ data.description }}</p>
					<div v-if="data.button_text" class="banner-action">
						<NuxtLink :to="data.button_link || '#'" class="banner-btn">
							{{ data.button_text }}
						</NuxtLink>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
defineProps<{
	data: {
		title?: string
		description?: string
		button_text?: string
		button_link?: string
	}
}>()
</script>

<style scoped>
.info-banner-block {
	padding: 50px 0 70px;
	background: #FFFFFF;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.banner-card {
	background: linear-gradient(135deg, #0066CC 0%, #004080 100%);
	border-radius: 24px;
	padding: 60px 40px;
	text-align: center;
	color: #FFFFFF;
	box-shadow: 0 16px 36px rgba(0, 102, 204, 0.2);
}

.banner-content {
	max-width: 700px;
	margin: 0 auto;
}

.banner-title {
	font-size: 32px;
	font-weight: 700;
	margin-bottom: 16px;
	color: #FFFFFF;
}

.banner-desc {
	font-size: 16px;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.85);
	margin-bottom: 32px;
}

.banner-btn {
	display: inline-block;
	padding: 14px 36px;
	background: #FFFFFF;
	color: #0066CC;
	font-weight: 700;
	font-size: 15px;
	border-radius: 30px;
	text-decoration: none;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.banner-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
	.banner-card {
		padding: 40px 20px;
	}
	.banner-title {
		font-size: 24px;
	}
}
</style>
