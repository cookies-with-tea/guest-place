export interface MediaItem {
  id: string
  title?: string
  alt?: string
  url: string
  filename: string
  size: number
  createdAt: Date
  type: 'image' | 'video'
}

export interface MediaFile {
  file: File
  name: string
  type: string
  size: number
  preview: string
}

export interface IMedia {
  alt?: string
  title?: string
  file: File
}

export interface ICreateMedia {
  title?: string
  alt?: string
  file: File
}

export interface IUpdateMedia {
  id: string
  title?: string
  alt?: string
}

export interface MediaResponse {
  data: MediaItem[]
  total: number
  page: number
  limit: number
}
