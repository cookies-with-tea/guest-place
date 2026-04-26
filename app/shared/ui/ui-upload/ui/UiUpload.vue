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
        id="avatar"
        type="file"
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
  --ui-upload-border-color: #c6c6cc;
  --ui-upload-button-bg-color: var(--color-accent);
  --ui-upload-button-color: #fff;

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
  gap: 8px;


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

//@keyframes borderAnimation {
//  from {
//    background-position: 0 0, -17px 0, 100% -17px, 0 100%;
//  }
//  to {
//    background-position: 0 -17px, 0 0, 100% 0, -17px 100%;
//  }
//}
</style>
