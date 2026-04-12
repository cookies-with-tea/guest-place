<template>
	<div class="temp-auth">
		<ElPopover>
			<template #reference>
				<ElButton> Действия </ElButton>
			</template>

			<ElInput v-model="authToken" placeholder="Введите токен" />
		</ElPopover>
	</div>
</template>

<script lang="ts" setup>
import { useAuthTemp } from '#shared/lib/composables/useTempAuth'
import { ElButton, ElInput, ElPopover } from 'element-plus'

const { authToken } = useAuthTemp()
</script>
