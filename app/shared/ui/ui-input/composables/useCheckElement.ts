import { onMounted , useTemplateRef, ref} from 'vue'
import type { UiIconInstanceType } from '#shared/ui/ui-icon/types'
export const useCheckElement = () => {
  const iconEye = useTemplateRef<UiIconInstanceType>('eye-ref')
  const iconContainer = iconEye.value?.$el
  console.log(iconContainer)
  if (!iconContainer) return

  const eyeOpen = iconContainer.querySelector('#eye-open path')
  const eyeClosed = iconContainer.querySelector('#eye-closed path')
  const eye = iconContainer.getElementById('eye')
  const upper = iconContainer.getElementById('lid--upper')
  const lower = iconContainer.getElementById('lid--lower')


  // onMounted(() => {
  //   console.log(eyeOpen)
  // })
  // return {
  //   iconEye,
  //   iconContainer,
  //   eyeOpen,
  //   eyeClosed, eye,
  //   upper, lower
  // }
}
