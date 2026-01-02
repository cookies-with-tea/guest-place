export const removeFileExtension = (filename: string) => {
	const lastDotIndex = filename.lastIndexOf('.')

	if (lastDotIndex === -1) {
		return filename
	}

	return filename.slice(0, lastDotIndex)
}
