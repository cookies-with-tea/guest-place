export const useFakeFetch = async <T>(
  url: string,
  options: any,
  mock?: T
): Promise<{ data: { value: { data: T | undefined } }; error: { value: undefined } }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          value: {
            data: mock,
          },
        },
        error: {
          value: undefined,
        },
      })
    }, 300)
  })
}
