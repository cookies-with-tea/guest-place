import { describe, expect, it } from 'vitest'
import { camelToSnake, snakeToCamel } from '../mappers'

describe('mappers utils', () => {
  describe('snakeToCamel', () => {
    it('converts top-level snake_case keys to camelCase', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        created_at_time: '2026-10-04',
      }
      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        createdAtTime: '2026-10-04',
      }

      expect(snakeToCamel(input)).toEqual(expected)
    })

    it('handles nested objects recursively', () => {
      const input = {
        user_info: {
          contact_email: 'test@example.com',
          billing_address: {
            street_name: 'Main St',
            zip_code: '12345',
          },
        },
      }
      const expected = {
        userInfo: {
          contactEmail: 'test@example.com',
          billingAddress: {
            streetName: 'Main St',
            zipCode: '12345',
          },
        },
      }

      expect(snakeToCamel(input)).toEqual(expected)
    })

    it('handles arrays of objects correctly', () => {
      const input = {
        room_types: [
          { room_id: 1, is_available: true },
          { room_id: 2, is_available: false },
        ],
      }
      const expected = {
        roomTypes: [
          { roomId: 1, isAvailable: true },
          { roomId: 2, isAvailable: false },
        ],
      }

      expect(snakeToCamel(input)).toEqual(expected)
    })

    it('returns primitives and null as is', () => {
      expect(snakeToCamel(null as any)).toBeNull()

      expect(snakeToCamel('string' as any)).toBe('string')

      expect(snakeToCamel(42 as any)).toBe(42)
    })
  })

  describe('camelToSnake', () => {
    it('converts camelCase keys to snake_case', () => {
      const input = {
        firstName: 'Alice',
        userRole: 'admin',
        totalPriceEur: 150,
      }
      const expected = {
        first_name: 'Alice',
        user_role: 'admin',
        total_price_eur: 150,
      }

      expect(camelToSnake(input)).toEqual(expected)
    })

    it('handles nested objects and arrays in camelToSnake', () => {
      const input = {
        bookingDetails: {
          guestList: [{ guestName: 'Alice' }, { guestName: 'Bob' }],
        },
      }
      const expected = {
        booking_details: {
          guest_list: [{ guest_name: 'Alice' }, { guest_name: 'Bob' }],
        },
      }

      expect(camelToSnake(input)).toEqual(expected)
    })
  })
})
