import type { AvailableRouterMethod, NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { IResponse } from '#shared/interfaces'
import { snakeToCamel } from '../utils'

export const useFetchData = <T>(
  url: string,
  options?: NitroFetchOptions<NitroFetchRequest & AvailableRouterMethod<string>>
) => {
  const result = useFetch<IResponse<T>>(url, {
    ...options,
    transform: (rawData) => snakeToCamel(rawData) as IResponse<T>,
  })

  return result
}
