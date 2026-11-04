# Внутреннее соглашение на проекте

> Стараться всегда поддерживать актуальность файла [README.md](README.md)

## Оглавление

- [Рекомендаци перед началом разработки, после разворачивания проекта](CONTRIBUTING.md#first-commit)
- [Рекомендаци по содеражнию README.md](CONTRIBUTING.md#readme)
- [Правила для скриптов](CONTRIBUTING.md#scripts)
- [Правила для разметки](CONTRIBUTING.md#templates)
- [Правила для стилей](CONTRIBUTING.md#styles)
- [Правила для комментариев](CONTRIBUTING.md#comments)
- [Структура проекта](ARCHITECTURE.md#структура-проекта)
- ["Соглашение трёх амиго"](CONTRIBUTING.md#three-amigos-rules)
- [Code & File Style](CONTRIBUTING.md#code-&-file-style)
- [Работа с репозиторием](CONTRIBUTING.md#git)
- [Полезные ссылки](CONTRIBUTING.md#helpfull-links)

## Readme

- [NPM commands](README.md#npm-commands) Список команд из консоли для проекта.
- [GitFlow](README.md#gitflow) Правила ветвления на проекте.
- [Features](README.md#features) (Опционально) Описание уникальных тонкостей проекта, способствующие скорейшему погружению в проект.
- [Description](README.md#description) (Опционально) Описание ключевых моментов в настройке проекта, не связанные с разработкой.

## Scripts

- Методы-обработчики именуются: `handle{{цель}}{{действие}}`. Пример: `handleUserChange`.
- Булевские переменные именуются: `is{{цель}}{{условие}}`. Пример: `isModalVisible`, `hasModalTitle`.
- Методы-действия именуются: `{{глагол}}{{контекст}}`. Пример: `getUser`, `generateStyle` и т.д. Так же глагол должен использоваться один и тот же во всех методах-действиях одного типа. Например, получение чего-либо - всегда `get...`, не использовать синонимы, по типу `take` и прочие. Если `generate` - всегда `generate`, не нужно мешать с, например, `make`.
- Стараемся типизировать всё (`any` не приветствуется (P.S. если тип неизвестен, лучше использовать `unknown`, чем `any`)). Если есть место, где по каким-то причинам получается использовать только `any`, то лучше этот момент описать или вынести на обсуждение (при необходимости).
- Используем синтаксический сахар `<script setup>`, рекомендуемый при Composition API внутри SFC
- Любые кастомные типы пишутся в `PascaleCase` и обязательно должны иметь в конце имени постфикс `Type`. Например:  
  Типы компонента - `type {{ПолноеНазваниеФайлаКомпонента}}{{НазваниеТипа}}Type = ...` => `type CGButtonModeType = ...`  
  Swagger типы (API) - `type Api{{ApiПапка}}{{НазваниеТипа}}Type = ...` => `type ApiAuthorizationUserDataResponseType = ...`  
  Обычные типы - `type {{НазваниеТипа}}Type = ...` => `type DatetimeFormatType = ...`

## Templates

- Именование компонентов используется в стиле `CamelCase` и используется 2 или более слова (включая префикс) во избежание коллизий с нативным HTML. Пример:

```html
<CGButton...$attrs />
<CAMyComponent ...$attrs />
<CBPageComponent ...$attrs />
```

## Styles

- Именование классов по методологии BEM `block-name__item-name--modificator`
- Именование айдишников `kebab-case`
- Название SASS переменной формируется: `$scope-name--param-name`
- Название CSS переменной формируется: `--kebab-case`  
  Хорошим тоном будет добавление такой же переменной, градиентов, с постфиксом `-rgb` для использования её в методах `css` такие как `rgba()`. Потому что у дизайнеров есть причуда применять на граиентах `opacity`. Например:

```scss
:root {
  --color-violent: #ff00ff;
  --color-violent-rgb: 255, 0, 255;
}

.some-class {
  color: rgba(--color-violent-rgb, 0.8);
}
```

- Локальная стилизация компонента находится в нём же (паттерн SFC) и не затрагивает внешние модули (scoped)

```html
<template>
  <div class="ui-card">
    <div class="ui-card__header" id="user-card-header">
      <h2>Header</h2>
    </div>
    <div class="ui-card__info">
      <span>Info</span>
    </div>
    <div class="ui-card__price ui-card__price--hidden">
      <span>1000</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .ui-card {
    $root: &;
    $height--primary: 100px;

    --ui-card--height: $height--primary * 0.5;

    :deep(.c-class) {
      #{$root}__info {
        height: var(--ui-card--height);
      }
    }
  }
</style>
```

- Глобальные классы
  - Отступы: `{{вид_отступа}}-{{размер_экрана_если_требуется}}-{{размер_отступа}}`. Пример: `m-4`, `ml-4`, `ml-lg-4`, `p-4`, `pl-4`, `pl-lg-4`
  - Цвета: `{{вид_заливки}}-{{наименование_цвета}}`. Пример: `color-primary`, `bg-color-secondary`
  - Не используем в проекте `font-weight`, `font-size` и `font-family`, вместо этого используем абстрактные классы `.h1`, `.text-sm`, `.bold` и т. д.
- В svg-файлах в папке `src/assets/icons` в заливку (fill) ставить `currentColor`
- Избегайте использование `!important`, линтеры будут выкидывать warning. Если не удаётся отказаться от него: добавляем исключение и описываем почему используем:

```scss
.input {
  // описываем почему используем !important
  content: none !important; /* stylelint-disable-line declaration-no-important */
}
```

### Порядок кода в SFC

- В script определённый порядок (сверху вниз) описания переменных, методов и т. д., а именно:
  - defineModel
  - props / emits (с типизацией)
  - defineOptions
  - defineSlots
  - composables
  - ref / reactive / shallowRef / readonly / toRef / toRefs и другие реактивные переменные
  - computed
  - watch / watchEffect
  - lifecycle hooks:
    - onServerPrefetch
    - onActivated
    - onDeactivated
    - onBeforeMount
    - onMounted
    - onBeforeUpdate
    - onUpdated
    - onBeforeUnmount
    - onUnmounted
    - onErrorCaptured
    - onRenderTracked
    - onRenderTriggered
  - methods
- Template компонента должен быть максимально чистым (за исключением самостоятельных компонентов) `<div>{{ new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount) }}</div>`. Вместо этого вынести подобную логику, либо в метод-обработчик/действие, либо, если позволяет логика, в `computed`, для чистоты кода
- Все константы именуются `UPPER_CASE`
- Любой объект/массив в файле констант помечать `as const`

```ts
const DISCOUNTS = {
  promo: 10,
  newYear: 7,
  blackFriday: 25,
} as const

const DISCOUNTS = ['first', 'seconds'] as const

type DiscountsEventType = keyof typeof DISCOUNTS // "promo | newYear | blackFriday"

type DiscountsValueType = (typeof DISCOUNTS)[DiscountsEventType] // "10 | 7 | 25", если бы не было "as const", то было бы "number"

type DiscountsType = keyof typeof DISCOUNTS // "first | seconds", вместо "string[]"
```

- В style (только scoped) именование селектора должно соответствовать названию файла. Например: `UserCard.vue` => `.user-card { ... }`
- Пример `single file component`:

```html
<!-- UserCard.vue -->
<template>
  <div class="user-card">
    <div class="user-card__info">
      <span> {{ userWithId }} </span>
      <span v-if="!isMobile"> Баланс: {{ balance }} </span>
    </div>
    <button class="user-card__action user-card__action--secondary" @click="handleUserChange">
      Click to change user
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  type Props = {
    // some params...
  }

  type Emits = {
    // some params...
  }

  const props = defineProps<Props>()
  // Опционально, если надо дефолтные значения указать
  // const props = withDefaults(defineProps<Props>(), {
  //   // some params...
  // })
  const emit = defineEmits<Emits>()

  const { isMobile } = useScreen()

  let id = ref(1)

  const userWithId = computed(() => `Пользователь ${id}`)
  const balance = computed(() =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(props.balance)
  )

  onMounted(() => {
    //some logic...
  })

  const handleUserChange = () => {
    id.value += 1
  }
</script>

<style scoped lang="scss">
  --user-card--text: #c0c0c0;
  --user-card--btn-background: #a0a0c0;

  .user-card {
    $root: &;

    display: flex;
    align-items: center;
    justify-content: center;

    &__info {
      color: var(--user-card--text);
    }

    &__action {
      ...
      &--secondary {
        background: var(--user-card--btn-background);
      }
      #{$root}__some-another-class {
        ...
      }
    }
  }
</style>
```

### Composables

```TypeScript
// src/composables/user.ts

/**
 * Определяем "глобальные" переменные,
 * изменение которых осуществляется только через вспомогательные функции
 */
const user = ref<UserType>()
const isLoading = ref(false)

/**
 * Вспомогательные функции
 */
const setUser = (paylod: UserType) => {
  user.value = payload
}

/**
 * Основной кастомный экземпляр composition Api
 */
export const useUser = () => {
  /**
   * Часто используемые данные
   */
  const isAdmin = computed<boolean>(() => user.value?.type === 'admin')

  return {
    /**
     * Все переменные должны быть readonly,
     * чтобы не было случайных изменений
     */
    user: readonly(user),
    isLoading: readonly(isLoading),
    isAdmin: readonly(isAdmin)
    setUser,
  }
}

/**
 * Функции-фабрики, функции-мэперы
 */
export const userFetchFactory = async () => {
  isLoading.value = true

  const [error, response] = await UserApi.getUser()

  isLoading.value = false

  if (response) {
    setUser(response.data)
  }
}
```

## Helpfull Links

- [Style Guide](https://vuejs.org/style-guide/) (обязательно к прочтению)
- [Style Guide (Ru)](https://v3.ru.vuejs.org/ru/style-guide/) (обязательно к прочтению)
- [Composition API](https://vuejs.org/api/options-composition.html)
- [Best Practices from Vue](https://vuejs.org/guide/best-practices/production-deployment.html)
- [Tips & Best Practices](https://medium.com/js-dojo/vue-3-tips-best-practices-54aec91d95dc)
- [6 Tips for Building Large Scale Applications](https://vueschool.io/articles/vuejs-tutorials/6-tips-for-building-large-scale-vue-js-3-applications/)
- [Script setup](https://vuejs.org/api/sfc-script-setup.html#script-setup)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [TypeScript. Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript. Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [SCSS. Documentation (Ru)](https://sass-scss.ru/documentation/)
- [SCSS. Documentation](https://sass-lang.com/documentation)
- [SCSS. Playground](https://www.sassmeister.com/)
