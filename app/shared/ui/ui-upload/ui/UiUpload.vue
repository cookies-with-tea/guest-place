<template>
  <div class="ui-upload">
      <UiIcon
        name="download"
        width="40px"
        height="36px"
      />

      <span class="ui-upload__on-drag">
       Перетащите файл сюда
      </span>

      <span class="ui-upload__or">
        или
      </span>

      <input
        type="file"
        id="avatar"
        hidden
        name="avatar"
        accept="image/png, image/jpeg"
      />

      <button class="ui-upload__btn" type="button">
        <UiIcon
          name="attach"
          width="16px"
          height="16px"
        />

        Выберите файл
      </button>

      <span class="ui-upload__max-weight">
         Максимальный размер файла 30 MB
      </span>
  </div>

</template>

<script setup lang="ts">
import { UiIcon } from '#shared/ui';

</script>

<style scoped lang="scss">
@use 'public/styles/helpers/functions' as *;

.ui-upload {
  --ui-upload-border-color: #C6C6CC;
  --ui-upload-button-bg-color: var(--color-accent);
  --ui-upload-button-color: #fff;

  display: flex;
  width: 100%;
  gap: 8px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  background-image: repeating-linear-gradient(179deg, var(--ui-upload-border-color), var(--ui-upload-border-color) 8px, transparent 8px, transparent 17px, var(--ui-upload-border-color) 17px), repeating-linear-gradient(269deg, var(--ui-upload-border-color), var(--ui-upload-border-color) 8px, transparent 8px, transparent 17px, var(--ui-upload-border-color) 17px), repeating-linear-gradient(-1deg, var(--ui-upload-border-color), var(--ui-upload-border-color) 8px, transparent 8px, transparent 17px, var(--ui-upload-border-color) 17px), repeating-linear-gradient(89deg, var(--ui-upload-border-color), var(--ui-upload-border-color) 8px, transparent 8px, transparent 17px, var(--ui-upload-border-color) 17px);
  background-size: 2px calc(100% + 17px), calc(100% + 17px) 2px, 2px calc(100% + 17px) , calc(100% + 17px) 2px;
  background-position: 0 0, 0 0, 100% 0, 0 100%;
  background-repeat: no-repeat;
  animation: borderAnimation 0.9s infinite linear reverse;
  height: 204px;


  &__on-drag {
    @include typography(h5);

    color: var(--color-text-dark);
  }

  &__or {
    @include typography(h5);

    color: var(--color-text-regular);
    font-weight: 300;
  }

  &__btn {
    @include typography(body);

    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ui-upload-button-color);
    background-color: var(--ui-upload-button-bg-color);
    border-radius: 4px;
    padding: 6px 12px;

    @include hover {
      color: darken(var(--ui-upload-button-color));
    }
  }

  &__max-weight {
    @include typography(body);

    color: var(--color-text-regular);
    vertical-align: middle;
  }
}

//@keyframes borderAnimation {
//  from {
//    background-position: 0 0, -17px 0, 100% -17px, 0 100%;
//  }
//  to {
//    background-position: 0 -17px, 0 0, 100% 0, -17px 100%;
//  }
//}
</style>
