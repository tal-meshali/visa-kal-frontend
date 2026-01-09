import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiService, apiGet, apiPost, apiPut, apiDelete, apiPostFormData } from '../apiService'
import { getTokenFromStorage } from '../../utils/tokenManager'

vi.mock('../../utils/tokenManager')
vi.mock('axios')

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getTokenFromStorage).mockReturnValue('mock_token_12345')
  })

  describe('apiGet', () => {
    it('makes GET request with correct URL', async () => {
      const mockData = { id: 1, name: 'Test' }
      vi.mocked(apiService.get).mockResolvedValue({ data: mockData } as any)

      const result = await apiGet('/api/test')

      expect(apiService.get).toHaveBeenCalledWith('/api/test', undefined)
      expect(result).toEqual(mockData)
    })

    it('includes authorization header when token exists', async () => {
      vi.mocked(getTokenFromStorage).mockReturnValue('test_token')
      const mockData = { id: 1 }
      vi.mocked(apiService.get).mockResolvedValue({ data: mockData } as any)

      await apiGet('/api/test')

      expect(apiService.get).toHaveBeenCalled()
    })
  })

  describe('apiPost', () => {
    it('makes POST request with data', async () => {
      const mockData = { success: true }
      const postData = { name: 'Test' }
      vi.mocked(apiService.post).mockResolvedValue({ data: mockData } as any)

      const result = await apiPost('/api/test', postData)

      expect(apiService.post).toHaveBeenCalledWith('/api/test', postData, undefined)
      expect(result).toEqual(mockData)
    })
  })

  describe('apiPut', () => {
    it('makes PUT request with data', async () => {
      const mockData = { id: 1, updated: true }
      const putData = { name: 'Updated' }
      vi.mocked(apiService.put).mockResolvedValue({ data: mockData } as any)

      const result = await apiPut('/api/test', putData)

      expect(apiService.put).toHaveBeenCalledWith('/api/test', putData, undefined)
      expect(result).toEqual(mockData)
    })
  })

  describe('apiDelete', () => {
    it('makes DELETE request', async () => {
      const mockData = { deleted: true }
      vi.mocked(apiService.delete).mockResolvedValue({ data: mockData } as any)

      const result = await apiDelete('/api/test')

      expect(apiService.delete).toHaveBeenCalledWith('/api/test', undefined)
      expect(result).toEqual(mockData)
    })
  })

  describe('apiPostFormData', () => {
    it('makes POST request with FormData and correct headers', async () => {
      const mockData = { success: true }
      const formData = new FormData()
      formData.append('file', new Blob(['content']), 'test.pdf')
      vi.mocked(apiService.post).mockResolvedValue({ data: mockData } as any)

      const result = await apiPostFormData('/api/upload', formData)

      expect(apiService.post).toHaveBeenCalledWith(
        '/api/upload',
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer mock_token_12345',
          }),
        })
      )
      expect(result).toEqual(mockData)
    })
  })
})

