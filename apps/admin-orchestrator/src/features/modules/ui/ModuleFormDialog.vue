<template>
	<UiModal v-model="mfe.dialogVisible" :title="mfe.isEdit ? 'Редактировать MFE' : 'Добавить MFE'" width="560px">
		<el-form class="mfe-form" label-position="top" :model="mfe.form">
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="ID (name)">
						<el-input v-model="mfe.form.name" :disabled="mfe.isEdit" placeholder="напр. admin-about" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Отображаемое название">
						<el-input v-model="mfe.form.displayName" placeholder="напр. About Page" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-form-item label="URL (entry point)">
				<el-input v-model="mfe.form.url" placeholder="http://localhost:3006/assets/remoteEntry.js">
					<template #prefix>
						<el-icon><Link /></el-icon>
					</template>
				</el-input>
			</el-form-item>

			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Scope">
						<el-input v-model="mfe.form.scope" placeholder="about" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Module">
						<el-input v-model="mfe.form.module" placeholder="./AboutRoutes" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="16">
				<el-col :span="8">
					<el-form-item label="Icon (Element Plus)">
						<el-input v-model="mfe.form.icon" placeholder="EditPen">
							<template #prefix>
								<el-icon><component :is="getIcon(mfe.form.icon)" /></el-icon>
							</template>
						</el-input>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="Версия">
						<el-input v-model="mfe.form.version" placeholder="1.0.0" />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="Категория">
						<el-select v-model="mfe.form.category" style="width: 100%">
							<el-option label="System" value="system" />
							<el-option label="Website" value="website" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="Порядок">
						<el-input-number v-model="mfe.form.orderIndex" :max="100" :min="0" style="width: 100%" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-form-item label="Активен">
				<el-switch v-model="mfe.form.enabled" :disabled="mfe.form.name === 'orchestrator'" />
			</el-form-item>
		</el-form>

		<template #footer>
			<el-button plain @click="mfe.dialogVisible = false">Отмена</el-button>
			<el-button :loading="mfe.isSubmitting" type="primary" @click="mfe.saveMfe">
				{{ mfe.isEdit ? 'Сохранить изменения' : 'Создать' }}
			</el-button>
		</template>
	</UiModal>
</template>

<script setup lang="ts">
import { UiModal } from '@admin-panel/ui'
import * as Icons from '@element-plus/icons-vue'
import { Link } from '@element-plus/icons-vue'

defineProps<{
	mfe: {
		dialogVisible: boolean
		isEdit: boolean
		form: Record<string, any>
		isSubmitting: boolean
		saveMfe: () => void
	}
}>()

const getIcon = (name: string) => (Icons as any)[name] || Icons.Menu
</script>
