import type { AvailableRouterMethod, NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { IResponse } from '#shared/interfaces'
import { snakeToCamel } from '../utils'

export const useFetchData = async <T>(
  url: string,
  options?: NitroFetchOptions<NitroFetchRequest & AvailableRouterMethod<string>>
) => {
  const result = useFetch<IResponse<T>>(url, {
    ...options,
    transform: (rawData) => {
      return snakeToCamel(rawData) as IResponse<T>
    },
  })

  const _result = await result


  if (_result?.error?.value?.data) {
    snakeToCamel(_result.error.value.data.errors)

    return toRef({
      ...result,
      data: toRef(null),
      errors: toRef(snakeToCamel(_result.error.value.data.errors)),
      messages: toRef(snakeToCamel(_result.error.value.data.errors)),
    })
  }

  return result
}
