import type { ModelRef } from 'vue'
import type { TUiAccordionModelValue } from '../types'

export interface IUiAccordionProvider {
  model: ModelRef<TUiAccordionModelValue>
  multiple: boolean
}
