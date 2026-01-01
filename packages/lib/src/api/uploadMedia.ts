import { createApi } from '.'
import { removeFileExtension } from '../utils'

interface UploadRawFile extends File {
	uid: number
	isDirectory?: boolean
}

const { fetchData } = createApi('media')

export const uploadMedia = async (rawFile: UploadRawFile) => {
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
