<h1 align="center"><a href="https://api.thream.theoludwig.fr/documentation">Thream/api</a></h1>

<p align="center">
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/licence-MIT-blue.svg" alt="Licence MIT"/></a>
  <a href="./CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg" alt="Contributor Covenant" /></a>
  <br />
  <a href="https://github.com/Thream/api/actions/workflows/analyze.yml"><img src="https://github.com/Thream/api/actions/workflows/analyze.yml/badge.svg?branch=develop" /></a>
  <a href="https://github.com/Thream/api/actions/workflows/build.yml"><img src="https://github.com/Thream/api/actions/workflows/build.yml/badge.svg?branch=develop" /></a>
  <a href="https://github.com/Thream/api/actions/workflows/lint.yml"><img src="https://github.com/Thream/api/actions/workflows/lint.yml/badge.svg?branch=develop" /></a>
  <a href="https://github.com/Thream/api/actions/workflows/test.yml"><img src="https://github.com/Thream/api/actions/workflows/test.yml/badge.svg?branch=develop" /></a>
  <br />
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits" /></a>
  <a href="https://github.com/semantic-release/semantic-release"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="semantic-release" /></a>
</p>

## 📜 About

Thream's Application Programming Interface (API) to stay close with your friends and communities.

It uses [Thream/file-uploads-api](https://github.com/Thream/file-uploads-api) [v1.1.6](https://github.com/Thream/file-uploads-api/releases/tag/v1.1.6).

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 16.0.0
- [npm](https://www.npmjs.com/) >= 8.0.0
- [PostgreSQL](https://www.postgresql.org/)

### Installation

```sh
# Clone the repository
git clone git@github.com:Thream/api.git

# Go to the project root
cd api

# Install dependencies
npm clean-install

# Configure environment variables
cp .env.example .env

# Generate Prisma client types
npm run prisma:generate
```

### Database Setup

```sh
# Create a new user and database
psql
CREATE DATABASE thream;
CREATE USER thream_user with encrypted password 'password';
ALTER USER thream_user WITH SUPERUSER;
```

### Database Production migration

```sh
npm run prisma:migrate:deploy
```

### Local Development environment

Recommended to use [VSCode: Remote development in Containers](https://code.visualstudio.com/docs/remote/containers-tutorial).

#### Database Development migration

```sh
# Run Prisma migrations
npm run prisma:migrate:dev

# Reset the database (WARNING: This will delete all data)
npm run prisma:migrate:reset
```

#### Usage

```sh
npm run dev
```

##### Services started

- `api`: <http://127.0.0.1:8080>
- [Maildev](https://maildev.github.io/maildev/): <http://127.0.0.1:1080>
- [Prisma Studio](https://www.prisma.io/studio): <http://127.0.0.1:5555>

##### Commands

```sh
# Build, Lint and Test
npm run build
npm run build:typescript
npm run lint:editorconfig
npm run lint:markdown
npm run lint:eslint
npm run lint:prettier
npm run test
```

### Production environment (with [Docker](https://www.docker.com/))

```sh
docker compose up --build
```

## 💡 Contributing

Anyone can help to improve the project, submit a Feature Request, a bug report or
even correct a simple spelling mistake.

The steps to contribute can be found in [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

[MIT](./LICENSE)
