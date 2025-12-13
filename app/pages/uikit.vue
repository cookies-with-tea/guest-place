<template>
  <div class="ui-kit">
    <div class="box">
      <div id="buttons" class="column">
        <UiButton> Показать на карте </UiButton>

        <UiButton variant="secondary"> Показать на карте </UiButton>
      </div>

      <div class="column">
        <UiButton disabled> Показать на карте </UiButton>

        <UiButton variant="secondary" disabled> Показать на карте </UiButton>

        <UiButton tag="nuxt-link" to="/"> Это ссылка. кликни на меня ^_^ </UiButton>
      </div>

      <div class="column">
        <UiButton variant="text" disabled>
          <template #prefix-icon>
            <UiIcon name="house" width="26px" height="26px" />
          </template>

          <template #default> Показать рядом со мной </template>
        </UiButton>

        <UiButton variant="text">
          <template #prefix-icon>
            <UiIcon name="house" />
          </template>

          <template #default> Показать рядом со мной </template>
        </UiButton>
      </div>

      <div class="column">
        <UiButton variant="icon" disabled>
          <UiIcon name="house" width="26px" height="26px" />
        </UiButton>

        <UiButton variant="icon">
          <UiIcon name="house" width="26px" height="26px" />
        </UiButton>
      </div>
    </div>

    <div class="box">
      <UiIcon style="color: #000" name="close" width="50px" height="50px" />

      <UiIcon style="color: #f90" name="user" width="50px" height="50px" />

      <UiIcon style="color: #f90" name="shop-car" width="50px" height="50px" reverse />
    </div>

    <div class="box">
      <UiAccordion v-model="activeListAccordion" class="ui-kit__accordion">
        <UiAccordionItem v-for="(item, index) in faq" :key="index" :title="item.title" :name="index + 1">
          {{ item.text }}
        </UiAccordionItem>
      </UiAccordion>
    </div>

    <div class="box">
      <UiInput v-model="inputValue" placeholder="Ваше имя" type="password" size="md" show-password />

      <UiInput v-model="textareaValue" placeholder="Ваше имя" type="textarea" />

      <div class="column">
        <UiForm @submit.prevent="onSubmit">
          <UiFormItem name="refreshToken">
            <UiInput v-model="formData.refreshToken" placeholder="Refresh" />
          </UiFormItem>

          <UiButton type="submit"> Отправить </UiButton>
        </UiForm>
      </div>
    </div>

    <div class="box">
      <UiTabs id="tabs" v-model="activeTab" :tabs />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiAccordion, UiAccordionItem, UiButton, UiForm, UiFormItem, UiIcon, UiInput, UiTabs } from '#shared/ui'
import { ref, defineAsyncComponent } from 'vue'
import type { TUiAccordionModelValue } from '#shared/ui/ui-accordion/types'
import { FORM_RULES } from '#shared/constants'
import { authApi, type IAuthRefreshResponse, type IAuthRefreshUpdateRequest } from '#entities/auth'
import { useForm } from '#shared/ui/ui-form'
import type { Rules } from 'async-validator'

const formRules: Rules = {
  refreshToken: FORM_RULES.name,
}

const Comp1 = defineAsyncComponent(() => import('../shared/ui/Comp1.vue'))

const Comp2 = defineAsyncComponent(() => import('../shared/ui/Comp2.vue'))

const Comp3 = defineAsyncComponent(() => import('../shared/ui/Comp3.vue'))

const Comp4 = defineAsyncComponent(() => import('../shared/ui/Comp4.vue'))

const Comp5 = defineAsyncComponent(() => import('../shared/ui/Comp5.vue'))

const activeListAccordion = ref<TUiAccordionModelValue>('1')
const inputValue = ref('')
const textareaValue = ref('')

const formData = ref<IAuthRefreshUpdateRequest>({
  refreshToken: '',
})

const faq = ref([
  {
    title: 'Title',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    title: 'Second Question',
    text: 'Answer to the second question',
  },
])

const { handleSubmit } = useForm<IAuthRefreshUpdateRequest, IAuthRefreshResponse>({
  data: formData,
  rules: formRules,
  submitFn: authApi.refresh,
  onSuccess: (data) => {
    console.log('Success:', data)
  },
  onError: (error) => {
    console.error('Page error:', error)
  },
})

const onSubmit = async () => {
  await handleSubmit(formData)
}

const activeTab = ref('home')

const tabs = [
  {
    title: 'home',
    content: Comp1,
    name: 'home',
  },
  {
    title: 'user',
    content: Comp2,
    name: 'user',
  },
  {
    title: 'Comp3',
    content: Comp3,
    name: 'Comp3',
  },
  {
    title: 'Comp4',
    content: Comp4,
    name: 'Comp4',
  },
  {
    title: 'Comp5',
    content: Comp5,
    name: 'Comp5',
  },
]
</script>

<style lang="scss" scoped>
.ui-kit {
  display: grid;
  padding: 20px;
  gap: 20px;

  &__accordion {
    max-width: 40%;
  }
}

.box {
  width: fit-content;
  display: flex;
  border: 1px dashed rgb(89 0 131);
  padding: 20px;
  margin: 8px;
  gap: 40px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
