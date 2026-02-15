import { USERS_MESSAGES } from '~/constants/messages'

import { validate } from '~/utils/validation'
import { z } from 'zod'

export const createOrderValidator = validate(
  z.object({
    body: z.object({
      address: z
        .string({
          error: (issue) => {
            if (issue.code === 'invalid_type' && issue.input === undefined) {
              return { message: USERS_MESSAGES.ADDRESS_IS_REQUIRED }
            }
            return { message: USERS_MESSAGES.ADDRESS_MUST_BE_STRING }
          }
        })
        .min(5, {
          message: USERS_MESSAGES.ADDRESS_LENGTH_MUST_BE_AT_LEAST_5_CHARACTERS
        }),
      phone_number: z
        .string({
          error: (issue) => {
            if (issue.code === 'invalid_type' && issue.input === undefined) {
              return { message: USERS_MESSAGES.PHONE_NUMBER_IS_REQUIRED }
            }
            return { message: USERS_MESSAGES.PHONE_NUMBER_MUST_BE_STRING }
          }
        })
        .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
          message: USERS_MESSAGES.PHONE_NUMBER_IS_INVALID
        }),
      receiver_name: z.string({
        error: (issue) => {
          if (issue.code === 'invalid_type' && issue.input === undefined) {
            return { message: USERS_MESSAGES.RECEIVER_NAME_IS_REQUIRED }
          }
          return { message: USERS_MESSAGES.RECEIVER_NAME_MUST_BE_STRING }
        }
      }),
      payment_method: z.string({
        error: (issue) => {
          if (issue.code === 'invalid_type' && issue.input === undefined) {
            return { message: USERS_MESSAGES.PAYMENT_METHOD_IS_REQUIRED }
          }
          return { message: USERS_MESSAGES.PAYMENT_METHOD_MUST_BE_STRING }
        }
      })
    })
  })
)
