import type { AvailableRouterMethod, NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { IResponse } from '#shared/interfaces'

export const useFetchData = async <T>(
  url: string,
  options?: NitroFetchOptions<NitroFetchRequest & AvailableRouterMethod<string>>
) => {
  const result = useFetch<IResponse<T>>(url, {
    ...options,
  })

  return result
}
