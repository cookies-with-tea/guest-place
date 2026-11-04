import { onMounted, onUpdated, nextTick, onUnmounted, type Ref } from 'vue'

interface UseFlexWrapFixOptions {
  tabsWrapper: Ref<HTMLElement | null>
  className?: string
}

export const useFlexWrapFix = ({ tabsWrapper, className = 'is-new-row' }: UseFlexWrapFixOptions) => {
  const applyClasses = () => {
    const container = tabsWrapper.value

    if (!container) return
    const tabsRoot = container.closest('.ui-tabs')

    if (!tabsRoot) return

    const children = Array.from(container.children) as HTMLElement[]

    if (children.length === 0) return

    tabsRoot.classList.remove(className)

    const firstChild = children[0]

    if (!firstChild) return

    const firstTop = firstChild.offsetTop

    let newRowIndex = -1

    for (let i = 1; i < children.length; i++) {
      const child = children[i]

      if (child && child.offsetTop > firstTop) {
        newRowIndex = i

        break
      }
    }

    if (newRowIndex !== -1) {
      tabsRoot.classList.add(className)
    }
  }

  onMounted(async () => {
    await nextTick(applyClasses)

    window.addEventListener('resize', applyClasses)
  })

  onUpdated(async () => {
    await nextTick(applyClasses)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', applyClasses)
  })
}
