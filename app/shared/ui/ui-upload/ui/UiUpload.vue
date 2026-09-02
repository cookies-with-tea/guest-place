<template>
  <div
    class="ui-upload"
    :class="classes"
    @click="handleFileUploadOpen"
    @drop.prevent="drop"
    @dragenter="dragenter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="dragleave"
  >
    <UiIcon
      name="download"
      width="40px"
      height="36px"
    />

    <span class="ui-upload__on-drag">
       Перетащите файл сюда
    </span>

    <input
      id="avatar"
      ref="input-ref"
      type="file"
      hidden
      name="avatar"
      accept="image/png, image/jpeg"
      @change="handleFileUpload"
    />

    <template v-if="!isDragover">
      <span class="ui-upload__or">или</span>

      <button class="ui-upload__btn" type="button">
        <UiIcon name="attach" width="16px" height="16px" />
        Выберите файл
      </button>

      <span class="ui-upload__max-weight">
        Максимальный размер файла 30 MB
       </span>
    </template>
  </div>

<!--   Плавное появление/исчезновение превью файла -->
  <div style="color: red">
    {{ error }}
  </div>
<!--  v-if="!!modelValue"-->
  <template v-if="true">
    <div class="ui-upload__preview">
      <div class="ui-upload__group">
        <UiIcon
          name="attach"
          width="16px"
          height="16px"
        />

        <div class="ui-upload__file">
          <div class="ui-upload__file-text">
            {{ dataFiles }}
          </div>

          <div class="ui-upload__status">
            Файл загружен
          </div>
        </div>
      </div>

      <UiIcon
        name="close"
        width="12px"
        height="12px"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { UiIcon } from '#shared/ui';
import { mediaApi } from '#entities/media'
import { computed, ref, useTemplateRef } from 'vue'

interface IProps {
  maxSize?: number | string
}

// interface IEmits {
//   upload: [file: File]
// }

const props = withDefaults(defineProps<IProps>(), {
  maxSize: 1000,
})

console.log(props)

const isDragover = ref(false)

const classes = computed(() => {
  return {
    'is-dragover': isDragover.value
  }
})


let dragCounter = 0
const error = ref('')
const dataFiles = ref('')

const dragenter = (e) => {
  // e.dataTransfer.dropEffect = 'copy'
  console.log('я в зоне дропа', e);


  dragCounter++

  isDragover.value = true
}

function validationFile(event) {
  const isDropDirectory = event.dataTransfer.items[0].webkitGetAsEntry?.()

  if (isDropDirectory?.isDirectory) {
    error.value = "эй ты, черт! скинь файл , а не целую папку"

    return
  }

  return true
}

const dragleave = () => {
  console.log('я покинул зону для дропа');

  dragCounter--

  // Сбрасываем флаг только когда счётчик <= 0 (полный выход из зоны)
  if (dragCounter <= 0) {
    isDragover.value = false

    dragCounter = 0 // защита от отрицательных значений
  }
}

function onDragOver(e: DragEvent) {
  console.log('работаю всегда в зоне дропа')

  e.preventDefault()

  e.dataTransfer.dropEffect = 'copy';
}

const drop = (event: DragEvent) => {
  console.log('элемент сброшен', event.dataTransfer.files[0]);

  // Сбрасываем состояние сразу
  dragCounter = 0

  isDragover.value = false

  const fileDrop = event.dataTransfer.files[0]

  if (validationFile()){
    uploadMedia(fileDrop)
  }

  console.log(event.dataTransfer?.files[0].name)

}

// 1. типизировать: все
// 2.

//const emit = defineEmits<IEmits>()

const modelValue = defineModel<File | null>()

const inputRef = useTemplateRef<HTMLInputElement>('input-ref')

const handleFileUploadOpen = () => {
  inputRef.value?.click()
}

async function uploadMedia(file) {
  const formData = new FormData()

  formData.append('file', file)
  // formData.append('alt', 'someText')

  const { data } = await mediaApi.upload(formData)

  if (data) {
    modelValue.value = data.uuid

    dataFiles.value = file.name
  }
}

const resetFiles = () => {
  modelValue.value = null

  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

const handleFileUpload = () => {
  const file = inputRef.value?.files?.[0]

  if (file) {
    uploadMedia(file)
  }

  resetFiles()
}
</script>

<style scoped lang="scss">
@use 'public/styles/helpers/functions' as *;


.ui-upload {
  --ui-upload-border-color: #a8abb2;
  --ui-upload-bg-color: transparent;
  --ui-upload-error: #d51a52;
  --ui-upload-button-bg-color: var(--color-accent);
  --ui-upload-button-color: #fff;
  --ui-upload-icon-color: #a8abb2;

  width: 100%;
  height: 204px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-image: repeating-linear-gradient(179deg, var(--ui-upload-border-color), var(--ui-upload-border-color) 8px, transparent 8px, transparent 17px, var(--ui-upload-border-color) 17px), repeating-linear-gradient(269deg, var(--ui-upload-border-color), var(--ui-upload-border-color) 8px, transparent 8px, transparent 17px, var(--ui-upload-border-color) 17px), repeating-linear-gradient(-1deg, var(--ui-upload-border-color), var(--ui-upload-border-color) 8px, transparent 8px, transparent 17px, var(--ui-upload-border-color) 17px), repeating-linear-gradient(89deg, var(--ui-upload-border-color), var(--ui-upload-border-color) 8px, transparent 8px, transparent 17px, var(--ui-upload-border-color) 17px);
  background-position: 0 0, 0 0, 100% 0, 0 100%;
  background-size: 2px calc(100% + 17px), calc(100% + 17px) 2px, 2px calc(100% + 17px) , calc(100% + 17px) 2px;
  background-repeat: no-repeat;
  background-color: var(--ui-upload-bg-color);
  transition:
    border var(--transition-duration-primary),
    background-color var(--transition-duration-primary),
  ;
  animation: borderAnimation 0.9s infinite linear reverse;
  animation-play-state: paused;
  cursor: pointer;
  gap: 8px;

  & > :deep(.ui-icon) {
    color: var(--ui-upload-icon-color);
    transition: color var(--transition-duration-primary);
  }

  &__on-drag {
    @include typography(h5);

    color: var(--color-text-dark);
  }

  &__or {
    @include typography(h5);

    font-weight: 300;
    color: var(--color-text-regular);
  }

  &__btn {
    @include typography(body);

    display: flex;
    align-items: center;
    border-radius: 4px;
    color: var(--ui-upload-button-color);
    background-color: var(--ui-upload-button-bg-color);
    padding: 6px 12px;
    gap: 8px;

    @include hover {
      color: darken(var(--ui-upload-button-color));
    }
  }

  &__max-weight {
    @include typography(body);

    vertical-align: middle;
    color: var(--color-text-regular);
  }

  &__preview {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__group {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  &__file {
    &-text {
      @include typography(h5);

      color: #0f0bab;
    }
  }

  &__status {
    @include typography(body);

    color: #00b998;
  }

  &:hover,
  &.is-dragover {
    --ui-upload-border-color: #{lighten(var(--color-accent), 30)};
    --ui-upload-bg-color: #{darken(#ecf4fd, 5)};
    --ui-upload-icon-color: var(--color-accent);

    animation-play-state: running;
  }

  &:active {
    --ui-upload-bg-color: #{darken(#ecf4fd, 3)};
  }

  &--error {
    --ui-upload-border-color: var(--ui-upload-error);
    --ui-upload-icon-color: var(--ui-upload-error);
  }

  @keyframes borderAnimation {
    from {
      background-position: 0 0, -17px 0, 100% -17px, 0 100%;
    }

    to {
      background-position: 0 -17px, 0 0, 100% 0, -17px 100%;
    }
  }
}
</style>
