export interface Page {
  _id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  groups: string[]
  editorType: 'markdown' | 'summernote' | 'quill'
  slug: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreatePageData {
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  groups: string[]
  editorType: 'markdown' | 'summernote' | 'quill'
  slug?: string
  content?: string
}

export interface UpdatePageData extends CreatePageData {
  _id: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    pages: T[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ErrorResponse {
  success: false
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}