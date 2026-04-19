import { createApi } from '.'
import { removeFileExtension } from '../utils'

const { fetchData } = createApi('media')

export const uploadMedia = async (rawFile: File) => {
	const formData = new FormData()

	formData.append('file', rawFile)

	formData.append('title', removeFileExtension(rawFile.name))

	formData.append('alt', removeFileExtension(rawFile.name))

	const { data, errors } = await fetchData<{ uuid: string; url: string }>('', {
		method: 'POST',
		body: formData,
	})

	if (errors) {
		throw new Error(Object.keys(errors)[0])
	}

	return data
}
