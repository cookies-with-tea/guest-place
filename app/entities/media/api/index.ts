import { fetchData } from '#shared/api'

const upload = async (formData: FormData) => {
  return await fetchData('/api/v1/media', {
    method: 'POST',
    body: formData,
  })
}

export const mediaApi = {
  upload,
}