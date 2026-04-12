<template>
	<div class="temp-auth">
		<el-popover placement="bottom" :width="400" trigger="click">
			<template #reference>
				<el-button type="primary" :icon="Share">Действия</el-button>
			</template>

			<div class="popover-content">
				<el-form label-position="top">
					<el-form-item label="Добавить токен">
						<el-input v-model="authToken" placeholder="Введите токен" clearable />
					</el-form-item>
				</el-form>
			</div>
		</el-popover>
	</div>
</template>

<script lang="ts" setup>
import { Share } from '@element-plus/icons-vue'
import { useAuthTemp } from '#shared/lib/composables/useTempAuth'

const { authToken } = useAuthTemp()
</script>

<style scoped>
.temp-auth {
	display: inline-block;
}

.popover-content {
	padding: 10px 0;
}
</style>
