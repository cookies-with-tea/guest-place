import { describe, it, expect } from 'vitest'
import { removeFileExtension } from '../../utils/string'

describe('removeFileExtension', () => {
	it('should remove the file extension from a filename', () => {
		expect(removeFileExtension('test.png')).toBe('test')

		expect(removeFileExtension('image.jpeg')).toBe('image')

		expect(removeFileExtension('archive.tar.gz')).toBe('archive.tar')
	})

	it('should return the same string if there is no extension', () => {
		expect(removeFileExtension('README')).toBe('README')

		expect(removeFileExtension('dockerfile')).toBe('dockerfile')
	})

	it('should handle hidden files with no common extensions', () => {
		expect(removeFileExtension('.gitignore')).toBe('')
	})
})
