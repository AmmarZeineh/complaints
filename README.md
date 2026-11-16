# Government Complaints System — REST API

A NestJS backend where citizens file complaints to government agencies and agency employees handle them.
Each complaint moves through a tracked status (**New → In process → Completed / Rejected**), and the citizen is notified
by push notification at each step. The Flutter client is in [complaints_app](https://github.com/AmmarZeineh/complaints_app).

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?logo=swagger&logoColor=black)
![Firebase](https://img.shields.io/badge/Push-FCM-FFCA28?logo=firebase&logoColor=black)

## Features

- **Roles:** citizen, agency employee, super admin, each with its own access to the API.
- **Auth:** sign-up, JWT login (Passport local + JWT strategies) and logout, email verification codes, forgot / reset password (Nodemailer).
- **Complaints:** citizens submit a complaint to an agency with a type, location, description, and attached images and documents (Multer uploads, served statically).
- **Processing:** employees see the complaints of their own agency, change the status and add internal notes.
- **Notifications:** push notifications through Firebase Admin (FCM), plus an in-app notification list with read state.
- **Administration:** the super admin manages agencies (governments) and creates employee accounts.
- Soft deletes, a global exception filter and a single response format; interactive API docs with Swagger.

## Tech stack

NestJS 10 · TypeScript · Prisma · MySQL · Passport JWT · bcrypt · Nodemailer · Multer ·
firebase-admin · Swagger

## Project structure

```
src/
├── common/        # exception filter, mail, multer config, response wrapper
├── modules/
│   ├── auth/              # register, login, logout, guards and strategies
│   ├── emailVerfication/  # send / verify codes, password reset
│   ├── users/             # citizens, employees
│   ├── government/        # agencies
│   ├── complaint/         # complaints and their status flow
│   ├── complaintNote/     # employee notes on a complaint
│   ├── notification/      # FCM push + in-app notifications
│   └── prisma/
└── utils/swagger.ts
```

## Getting started

```bash
npm install
cp .env.example .env        # DATABASE_URL, PORT, SWAGGER_PATH
npx prisma migrate dev
npm run start:dev
```

API docs are served at `/<SWAGGER_PATH>` once the server is running.

## Author

**Ammar Zeineh**, Flutter Developer · [LinkedIn](https://linkedin.com/in/ammar-zeineh) · [GitHub](https://github.com/AmmarZeineh)
