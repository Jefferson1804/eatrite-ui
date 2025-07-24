// Jest test suite for app-services
// Mocks Supabase and tests all user activity functions

import {
  updateUserProfile,
  saveRecipe,
  getSavedRecipes,
  removeSavedRecipe
} from '../app-services'

// Mock the Supabase server client
// Use correct relative import for test context compatibility
let createServerSupabaseClientMock: jest.Mock

jest.mock('../../../../lib/supabase-server', () => {
  createServerSupabaseClientMock = jest.fn()
  return {
    createServerSupabaseClient: createServerSupabaseClientMock
  }
})

const mockFrom = jest.fn()
const mockUpdate = jest.fn()
const mockInsert = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockOrder = jest.fn()
const mockDelete = jest.fn()
const mockSingle = jest.fn()

const mockSupabase = {
  from: mockFrom
}

// Helper to reset all mocks
function resetAllMocks() {
  mockFrom.mockReset()
  mockUpdate.mockReset()
  mockInsert.mockReset()
  mockSelect.mockReset()
  mockEq.mockReset()
  mockOrder.mockReset()
  mockDelete.mockReset()
  mockSingle.mockReset()
}

beforeEach(() => {
  resetAllMocks()
  createServerSupabaseClientMock.mockResolvedValue(mockSupabase)
})

describe('app-services', () => {
  describe('updateUserProfile', () => {
    it('updates user profile and returns data', async () => {
      // Arrange
      const userId = 'user1'
      const profileData = { name: 'Test User' }
      const expected = { id: userId, ...profileData }
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle.mockResolvedValue({ data: expected, error: null })
            })
          })
        })
      })
      // Act
      const result = await updateUserProfile(userId, profileData)
      // Assert
      expect(result).toEqual(expected)
    })

    it('throws if Supabase returns error', async () => {
      const userId = 'user1'
      const profileData = { name: 'Test User' }
      const error = new Error('Update failed')
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle.mockResolvedValue({ data: null, error })
            })
          })
        })
      })
      await expect(updateUserProfile(userId, profileData)).rejects.toThrow('Update failed')
    })
  })

  describe('saveRecipe', () => {
    it('saves a recipe for a user', async () => {
      const userId = 'user1'
      const recipeId = 'recipe1'
      const expected = { user_id: userId, recipe_id: recipeId }
      mockFrom.mockReturnValue({
        insert: mockInsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: expected, error: null })
          })
        })
      })
      const result = await saveRecipe(userId, recipeId)
      expect(result).toEqual(expected)
    })
    it('throws if Supabase returns error', async () => {
      const userId = 'user1'
      const recipeId = 'recipe1'
      const error = new Error('Insert failed')
      mockFrom.mockReturnValue({
        insert: mockInsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: null, error })
          })
        })
      })
      await expect(saveRecipe(userId, recipeId)).rejects.toThrow('Insert failed')
    })
  })

  describe('getSavedRecipes', () => {
    it('returns saved recipes for a user', async () => {
      const userId = 'user1'
      const expected = [
        { recipe_id: 'recipe1', saved_at: '2024-01-01' },
        { recipe_id: 'recipe2', saved_at: '2024-01-02' }
      ]
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValue({
              then: (cb: (result: { data: unknown; error: unknown }) => unknown) => cb({ data: expected, error: null })
            })
          })
        })
      })
      // Patch: since .order returns a promise, we simulate it
      mockOrder.mockReturnValueOnce(Promise.resolve({ data: expected, error: null }))
      const result = await getSavedRecipes(userId)
      expect(result).toEqual(expected)
    })
    it('throws if Supabase returns error', async () => {
      const userId = 'user1'
      const error = new Error('Select failed')
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValueOnce(Promise.resolve({ data: null, error }))
          })
        })
      })
      await expect(getSavedRecipes(userId)).rejects.toThrow('Select failed')
    })
  })

  describe('removeSavedRecipe', () => {
    it('removes a saved recipe for a user', async () => {
      const userId = 'user1'
      const recipeId = 'recipe1'
      mockFrom.mockReturnValue({
        delete: mockDelete.mockReturnValue({
          eq: mockEq.mockReturnValue({
            eq: mockEq.mockReturnValue({
              then: (cb: (result: { error: unknown }) => unknown) => cb({ error: null })
            })
          })
        })
      })
      // Patch: .eq returns a promise
      mockEq.mockReturnValueOnce(Promise.resolve({ error: null }))
      const result = await removeSavedRecipe(userId, recipeId)
      expect(result).toBe(true)
    })
    it('throws if Supabase returns error', async () => {
      const userId = 'user1'
      const recipeId = 'recipe1'
      const error = new Error('Delete failed')
      mockFrom.mockReturnValue({
        delete: mockDelete.mockReturnValue({
          eq: mockEq.mockReturnValue({
            eq: mockEq.mockReturnValueOnce(Promise.resolve({ error }))
          })
        })
      })
      await expect(removeSavedRecipe(userId, recipeId)).rejects.toThrow('Delete failed')
    })
  })
}) 