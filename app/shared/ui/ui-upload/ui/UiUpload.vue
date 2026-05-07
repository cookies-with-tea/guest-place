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
      type="file"
      hidden
      name="avatar"
      accept="image/png, image/jpeg"
      ref="input-ref"
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

  <!-- Плавное появление/исчезновение превью файла -->
  <template v-if="!!modelValue">
    <div class="ui-uploader__preview">
      <i>Icon</i>
      <p class="ui-uploader__preview-name">{{ modelValue.name }}</p>
      <p class="ui-uploader__preview-success">Файл загружен</p>
      <button class="ui-uploader__preview-delete" @click="resetFiles">
        <i>Delete</i>
      </button>
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

interface IEmits {
  upload: [file: File]
}

const props = withDefaults(defineProps<IProps>(), {
  maxSize: 30
})

const isDragover = ref(false)

const classes = computed(() => {
  return {
    'is-dragover': isDragover.value
  }
})


let dragCounter = 0

const dragenter = (e) => {
  // e.dataTransfer.dropEffect = 'copy'
  console.log('я в зоне дропа', e);


  dragCounter++

  isDragover.value = true
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
  console.log('элемент сброшен', event.dataTransfer.files[0], event);
  // Сбрасываем состояние сразу
  dragCounter = 0
  isDragover.value = false

  // emit('upload', event.dataTransfer.files)
  // const files = event.dataTransfer?.files
  // if (files?.length) {
  //   const file = files[0]
  //   // Ваша логика валидации/отправки...
  //   // emit('upload', file)
  // }
}

// 1. типизировать: все
// 2.

const emit = defineEmits<IEmits>()

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
  }

  console.log(file)
}

const resetFiles = () => {
  modelValue.value = null

  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

const handleFileUpload = () => {
  const file = inputRef.value?.files?.[0]
  // console.log(inputRef.value?.files)

  if (file) {
    uploadMedia(file)
  }

  resetFiles()
}
</script>

<style scoped lang="scss">
@use 'public/styles/helpers/functions' as *;

.ui-upload {
  --ui-upload-border-color: #A8ABB2;
  --ui-upload-bg-color: transparent;
  --ui-upload-error: #D51A52;

  --ui-upload-button-bg-color: var(--color-accent);
  --ui-upload-button-color: #fff;

  --ui-upload-icon-color: #A8ABB2;

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
  animation: borderAnimation 0.9s infinite linear reverse;
  animation-play-state: paused;
  background-color: var(--ui-upload-bg-color);
  cursor: pointer;
  gap: 8px;
  transition:
    border var(--transition-duration-primary),
    background-color var(--transition-duration-primary),
  ;

  &:hover,
  &.is-dragover {
    --ui-upload-border-color: #{lighten(var(--color-accent), 30)};
    --ui-upload-bg-color: #{darken(#ECF4FD, 5)};
    --ui-upload-icon-color: var(--color-accent);
    animation-play-state: running;
  }

  &:active {
    --ui-upload-bg-color: #{darken(#ECF4FD, 3)};
  }

  & > :deep(.ui-icon) {
    color: var(--ui-upload-icon-color);
    transition: color var(--transition-duration-primary);
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
}
</style>
