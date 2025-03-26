## Description

kanban-api

## Package List

| Feature                                 | Installation Command                                                                                                                                       |
|:----------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Validation                              | npm i class-validator class-transformer                                                                                                                    |
| Database Integration                    | npm i @prisma/client pg<br/> npm install -D prisma                                                                                                         |
| Logging                                 | npm i nest-winston winston <br/> npm install -D @types/winston                                                                                             |
| Error Tracking                          | npm i @sentry/nestjs @sentry/profiling-node                                                                                                                |
| Configuration Management and Validation | npm i @nestjs/config joi                                                                                                                                   |
| Authentication                          | npm i @nestjs/passport @nestjs/jwt passport passport-jwt passport-local bcrypt<br/> npm install -D @types/passport-local @types/passport-jwt @types/bcrypt |
| WebSocket                               | npm i @nestjs/platform-socket.io @nestjs/websockets socket.io                                                                                              |
| Caching                                 | npm i @nestjs/cache-manager cache-manager                                                                                                                  |
| Redis Integration                       | npm i   @keyv/redis                                                                                                                                        |

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
