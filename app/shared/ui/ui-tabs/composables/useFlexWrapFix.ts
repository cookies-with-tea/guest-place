import { onMounted, onUpdated, nextTick, type Ref } from 'vue'

interface UseFlexWrapFixOptions {
  tabsWrapper: Ref<HTMLElement | null>
  className?: string // Класс, который добавится элементам новой строки
}

export const useFlexWrapFix = ({ tabsWrapper, className = 'is-new-row' }: UseFlexWrapFixOptions) => {
  const applyClasses = () => {
    const container = tabsWrapper.value

    if (!container) return

    const children = Array.from(container.children) as HTMLElement[]

    if (children.length === 0) return

    // Сбрасываем старые классы
    container.closest('.ui-tabs').classList.remove(className)

    // Получаем позицию первого элемента (эталон верхней границы)
    const firstTop = children[0].offsetTop

    // Находим первый элемент, у которого offsetTop больше, чем у первого
    // Это и есть начало второй строки
    let newRowIndex = -1

    for (let i = 1; i < children.length; i++) {
      if (children[i].offsetTop > firstTop) {
        newRowIndex = i

        break
      }
    }

    // Если нашли перенос, помечаем все последующие элементы (или только первый новой строки)
    if (newRowIndex !== -1) {
      // Опция 1: Добавить класс всем элементам второй и последующих строк
      for (let i = newRowIndex; i < children.length; i++) {
        container.closest('.ui-tabs').classList.add(className)
      }

      // Опция 2 (более частая): Добавить класс только ПЕРВОМУ элементу новой строки,
      // чтобы сделать ему отрицательный margin-top, равный gap контейнера
      // children[newRowIndex].classList.add(className);
    }
  }

  onMounted(async () => {
    await nextTick(applyClasses)

    window.addEventListener('resize', applyClasses)
  })

  onUpdated(async () => {
    await nextTick(applyClasses)
  })

  // Не забудьте убрать слушатель при unmount в реальном проекте
}
