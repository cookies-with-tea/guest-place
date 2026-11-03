/**
 * Media utility functions
 */

export const mediaUtils = {
	/**
	 * Check if a file is an image
	 */
	isImage: (file: File | string): boolean => {
		if (typeof file === 'string') {
			return (
				file.endsWith('.jpg') ||
				file.endsWith('.jpeg') ||
				file.endsWith('.png') ||
				file.endsWith('.gif') ||
				file.endsWith('.webp') ||
				file.endsWith('.svg')
			)
		}

		return file.type.startsWith('image/')
	},

	/**
	 * Check if a file is a video
	 */
	isVideo: (file: File | string): boolean => {
		if (typeof file === 'string') {
			return file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.avi') || file.endsWith('.mov')
		}

		return file.type.startsWith('video/')
	},

	/**
	 * Format file size in human-readable format
	 */
	formatFileSize: (bytes: number): string => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	},

	/**
	 * Format date in human-readable format
	 */
	formatDate: (date: Date | string): string => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	},

	/**
	 * Get MIME type from filename
	 */
	getMimeType: (filename: string): string => {
		if (filename.endsWith('.mp4')) return 'video/mp4'
		if (filename.endsWith('.webm')) return 'video/webm'
		if (filename.endsWith('.avi')) return 'video/x-msvideo'
		if (filename.endsWith('.mov')) return 'video/quicktime'
		if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
		if (filename.endsWith('.png')) return 'image/png'
		if (filename.endsWith('.gif')) return 'image/gif'
		if (filename.endsWith('.webp')) return 'image/webp'
		if (filename.endsWith('.svg')) return 'image/svg+xml'

		return 'application/octet-stream'
	},

	/**
	 * Create file preview URL
	 */
	createFilePreview: (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()

			reader.onload = (e) => {
				resolve(e.target?.result as string)
			}

			reader.onerror = (error) => {
				reject(error)
			}

			reader.readAsDataURL(file)
		})
	},

	/**
	 * Validate media file
	 */
	validateMediaFile: (file: File): { valid: boolean; message?: string } => {
		const maxSize = 50 * 1024 * 1024 // 50MB
		const allowedTypes = [
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
			'image/svg+xml',
			'video/mp4',
			'video/webm',
			'video/avi',
			'video/mov',
		]

		if (!allowedTypes.includes(file.type)) {
			return {
				valid: false,
				message: 'Unsupported file type. Please upload JPG, PNG, GIF, SVG, MP4, or AVI files.',
			}
		}

		if (file.size > maxSize) {
			return {
				valid: false,
				message: 'File size exceeds 50MB limit.',
			}
		}

		return { valid: true }
	},

	/**
	 * Generate placeholder image URL
	 */
	getPlaceholderImage: (): string => {
		return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjMwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij5JbWFnZSB0aGUgbWVkaWE8L3RleHQ+Cjwvc3ZnPgo='
	},
}
