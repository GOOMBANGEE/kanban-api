## Description

nestjs template

## Package List

| Feature                                 | Installation Command                                                                                                                                       |
| :-------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Validation                              | npm i class-validator class-transformer                                                                                                                    |
| Database Integration                    | npm i @prisma/client pg<br/> npm install -D prisma                                                                                                         |
| Logging                                 | npm i nest-winston winston <br/> npm install -D @types/winston                                                                                             |
| Error Tracking                          | npm i @sentry/nestjs @sentry/profiling-node                                                                                                                |
| Hot Reload (Webpack)                    | npm install -D webpack-node-externals run-script-webpack-plugin webpack                                                                                    |
| Configuration Management and Validation | npm i @nestjs/config joi                                                                                                                                   |
| Authentication                          | npm i @nestjs/passport @nestjs/jwt passport passport-jwt passport-local bcrypt<br/> npm install -D @types/passport-local @types/passport-jwt @types/bcrypt |

## Project setup

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
