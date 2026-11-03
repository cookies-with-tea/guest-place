<template>
	<UiGlassCard
		icon="House"
		title="Залы площадки"
		description="Вместимость банкетом, фуршетом, рассадкой театр и площадь каждого зала"
	>
		<template #actions>
			<el-button size="small" type="primary" :icon="Plus" @click="venueForm.addHall">Добавить зал</el-button>
		</template>

		<el-table :data="venueForm.formHalls" border class="styled-content-table" style="width: 100%">
			<el-table-column label="Название зала" min-width="150">
				<template #default="{ row }">
					<el-input v-model="row.name" placeholder="Атриум" @input="onChange" />
				</template>
			</el-table-column>
			<el-table-column label="Площадь м²" width="105">
				<template #default="{ row }">
					<el-input-number
						v-model="row.areaSqm"
						:min="1"
						controls-position="right"
						style="width: 100%"
						@change="onChange"
					/>
				</template>
			</el-table-column>
			<el-table-column label="Банкет" width="95">
				<template #default="{ row }">
					<el-input-number
						v-model="row.capacityBanquet"
						:min="0"
						controls-position="right"
						style="width: 100%"
						@change="onChange"
					/>
				</template>
			</el-table-column>
			<el-table-column label="Фуршет" width="95">
				<template #default="{ row }">
					<el-input-number
						v-model="row.capacityBuffet"
						:min="0"
						controls-position="right"
						style="width: 100%"
						@change="onChange"
					/>
				</template>
			</el-table-column>
			<el-table-column label="Театр" width="95">
				<template #default="{ row }">
					<el-input-number
						v-model="row.capacityTheater"
						:min="0"
						controls-position="right"
						style="width: 100%"
						@change="onChange"
					/>
				</template>
			</el-table-column>
			<el-table-column label="Особенности" min-width="140">
				<template #default="{ row }">
					<el-input v-model="row.extraDetails" placeholder="Панорамные окна" @input="onChange" />
				</template>
			</el-table-column>
			<el-table-column label="" width="50" align="center">
				<template #default="{ $index }">
					<el-button type="danger" link :icon="Close" @click="venueForm.removeHall($index)" />
				</template>
			</el-table-column>
		</el-table>
	</UiGlassCard>

	<UiGlassCard
		icon="Suitcase"
		title="Номерной фонд отеля"
		description="Категории номеров, тип размещения и стоимость проживания гостей"
	>
		<template #actions>
			<el-button size="small" type="primary" :icon="Plus" @click="venueForm.addRoom">Добавить номер</el-button>
		</template>

		<el-table :data="venueForm.formRooms" border class="styled-content-table" style="width: 100%">
			<el-table-column label="Тип номера" min-width="160">
				<template #default="{ row }">
					<el-input v-model="row.roomType" placeholder="Одноместный стандарт" @input="onChange" />
				</template>
			</el-table-column>
			<el-table-column label="Размещение" width="130">
				<template #default="{ row }">
					<el-input v-model="row.placement" placeholder="Одноместное" @input="onChange" />
				</template>
			</el-table-column>
			<el-table-column label="Цена (руб)" width="130">
				<template #default="{ row }">
					<el-input-number
						v-model="row.priceRub"
						:min="0"
						:step="500"
						controls-position="right"
						style="width: 100%"
						@change="onChange"
					/>
				</template>
			</el-table-column>
			<el-table-column label="Дополнительно" min-width="160">
				<template #default="{ row }">
					<el-input v-model="row.extraInfo" placeholder="Доп. место + 1000 р." @input="onChange" />
				</template>
			</el-table-column>
			<el-table-column label="" width="50" align="center">
				<template #default="{ $index }">
					<el-button type="danger" link :icon="Close" @click="venueForm.removeRoom($index)" />
				</template>
			</el-table-column>
		</el-table>
	</UiGlassCard>
</template>

<script setup lang="ts">
import { UiGlassCard } from '@admin-panel/ui'
import { Close, Plus } from '@element-plus/icons-vue'
import type { VenueForm } from '../../composables/useVenueForm'

defineProps<{
	venueForm: VenueForm
	onChange: () => void
}>()
</script>

<style scoped>
.styled-content-table {
	border-radius: 8px;
	background: transparent !important;
	overflow: hidden;
}
</style>
