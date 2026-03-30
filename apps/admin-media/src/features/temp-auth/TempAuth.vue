<template>
	<div class="temp-auth card flex justify-center">
		<Button type="button" icon="pi pi-share-alt" label="Действия" @click="toggle" />

		<Popover ref="op">
			<div class="flex flex-col gap-4 w-[25rem]">
				<div>
					<FloatLabel>
						<InputText id="over_label" v-model="authToken" />
						<label for="over_label">Добавить токен</label>
					</FloatLabel>
				</div>
			</div>
		</Popover>
	</div>
</template>

<script lang="ts" setup>
import Popover from 'primevue/popover'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import { ref } from 'vue'
import { useAuthTemp } from '#shared/lib/composables/useTempAuth'

const { authToken } = useAuthTemp()

const op = ref()

const toggle = (event: any) => {
	op.value.toggle(event)
}
</script>
