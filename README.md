## Description

kanban-api

## Package List

| Feature                                 | Package                                                                                                                               |
|:----------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| Authentication                          | @nestjs/passport @nestjs/jwt passport passport-jwt passport-local bcrypt<br/> @types/passport-local @types/passport-jwt @types/bcrypt |
| Caching                                 | @nestjs/cache-manager cache-manager                                                                                                   |
| Configuration Management and Validation | @nestjs/config joi                                                                                                                    |
| Database Integration                    | @prisma/client pg <br/>  prisma                                                                                                       |
| Error Tracking                          | @sentry/nestjs @sentry/profiling-node                                                                                                 |
| Logging                                 | nest-winston winston <br/> @types/winston                                                                                             |
| Rate Limiting                           | @nestjs/throttler                                                                                                                     |
| Redis Integration                       | @keyv/redis                                                                                                                           |
| Validation                              | class-validator class-transformer                                                                                                     |
| WebSocket                               | @nestjs/platform-socket.io @nestjs/websockets socket.io                                                                               |

## Project setup
\>= Node.js 20

```bash
git clone https://github.com/GOOMBANGEE/kanban-api.git

cd nestjs-template
cp sample.env .env

npm install
```

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

```

### Architecture

![architecture](https://github.com/user-attachments/assets/bbe8b79e-f2b6-4def-8483-b664a282a87a)

### ERD

![erd](https://github.com/user-attachments/assets/1f33eade-299f-4ea0-97f5-63ca1ba6b9ed)

### Board

![board](https://github.com/user-attachments/assets/b91bc964-c9c6-4135-a94c-098af57bf151)

### Ticket

![ticket](https://github.com/user-attachments/assets/b2d4e073-2ca3-40b0-8a56-251e3f23d176)