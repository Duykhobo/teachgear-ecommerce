import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'TechGear E-commerce API',
      version: '1.0.0',
      description: 'API Documentation for TechGear E-commerce backend using OpenAPI 3.0'
    },
    servers: [
      {
        url: '/',
        description: 'Current Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // Cấu hình đường dẫn cho cả lúc dev (.ts) và lúc chạy production docker (.js)
  apis: [
    './src/modules/**/*.route.ts',
    './src/modules/**/*.schema.ts',
    './dist/modules/**/*.route.js',
    './dist/modules/**/*.schema.js'
  ]
}

export const swaggerSpec = swaggerJsdoc(options)
