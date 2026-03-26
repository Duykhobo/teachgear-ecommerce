// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Trỏ alias '~/' vào thư mục src/ (Vì bạn đang dùng dấu ~ trong code)
    '^~/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'], // File chạy trước mỗi lần test
  testMatch: ['**/*.test.ts'] // Tìm các file có đuôi .test.ts
}

export default config
