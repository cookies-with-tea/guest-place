export const useCheckExists = (iconEye) => {
  const iconContainer = iconEye.value?.$el
  if (!iconContainer) return

  const eyeOpen = iconContainer.querySelector('#eye-open path')
  const eyeClosed = iconContainer.querySelector('#eye-closed path')
  const eye = iconContainer.getElementById('eye')
  const upper = iconContainer.getElementById('lid--upper')
  const lower = iconContainer.getElementById('lid--lower')

  return {iconContainer, eyeOpen, eyeClosed, eye, upper, lower}
}
