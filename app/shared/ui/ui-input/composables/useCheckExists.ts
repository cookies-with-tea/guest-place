import type { ShallowRef } from 'vue'
import type { UiIconInstanceType } from '#shared/ui/ui-icon/types'

export const useCheckExists = (iconEye: Readonly<ShallowRef<UiIconInstanceType>>)  => {
  const iconContainer = iconEye.value?.$el

  if (!iconContainer) {
    return {
      iconContainer: null, eyeOpen: null,
      eyeClosed: null, eye: null,
      upper: null, lower: null
    }
  }

  const eyeOpen = iconContainer.querySelector('#eye-open path')
  const eyeClosed = iconContainer.querySelector('#eye-closed path')
  const eye = iconContainer.getElementById('eye')
  const upper = iconContainer.getElementById('lid--upper')
  const lower = iconContainer.getElementById('lid--lower')

  return { iconContainer, eyeOpen, eyeClosed, eye, upper, lower }
}
