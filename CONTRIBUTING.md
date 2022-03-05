# 💡 Contributing

Thanks a lot for your interest in contributing to **Thream/api**! 🎉

## Code of Conduct

**Thream** has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as its Code of Conduct, and we expect project participants to adhere to it. Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Open Development

All work on **Thream/api** happens directly on [GitHub](https://github.com/Thream). Both core team members and external contributors send pull requests which go through the same review process.

## Types of contributions

- Reporting a bug.
- Suggest a new feature idea.
- Correct spelling errors, improvements or additions to documentation files.
- Improve structure/format/performance/refactor/tests of the code.

## Pull Requests

- **Please first discuss** the change you wish to make via issues.

- Ensure your code respect linting.

- Make sure your **code passes the tests**.

If you're adding new features to **Thream/api**, please include tests.

## Commits

The commit message guidelines respect
[@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)
and [Semantic Versioning](https://semver.org/) for releases.

### Types

Types define which kind of changes you made to the project.

| Types    | Description                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| feat     | A new feature.                                                                                               |
| fix      | A bug fix.                                                                                                   |
| docs     | Documentation only changes.                                                                                  |
| style    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).      |
| refactor | A code change that neither fixes a bug nor adds a feature.                                                   |
| perf     | A code change that improves performance.                                                                     |
| test     | Adding missing tests or correcting existing tests.                                                           |
| build    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).         |
| ci       | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs). |
| chore    | Other changes that don't modify src or test files.                                                           |
| revert   | Reverts a previous commit.                                                                                   |

### Scopes

Scopes define what part of the code changed.

### Examples

```sh
git commit -m "feat(services): add POST /users/signup"
git commit -m "docs(readme): update installation process"
git commit -m "fix(services): should emit events to connected users"
```

## Directory Structure

```text
├── email
├── prisma
└── src
    ├── models
    ├── scripts
    ├── services
    ├── tools
    └── typings
```

### Each folder explained

- `email` : email template(s) and translation(s)
- `prisma` : contains the prisma schema and migrations
- `src` : all source files
  - `models` : models that represent tables in database as JSON schema
  - `scripts` : scripts
  - `services` : all REST API endpoints
  - `tools` : configs and utilities
  - `typings` : types gloablly used in the project
- `uploads` : uploaded files by users

### Services folder explained with an example

We have API REST services for the `channels`.

Here is what potentially look like a folder structure for this service :

```text
└── src
    └── services
        └── channels
            ├── __test__
            │   └── get.test.ts
            ├── [channelId]
            │   ├── __test__
            │   │   ├── delete.test.ts
            │   │   └── put.test.ts
            │   ├── delete.ts
            │   ├── index.ts
            │   └── put.ts
            ├── get.ts
            └── index.ts
```

This folder structure will map to these REST API routes :

- GET `/channels`
- DELETE `/channels/:channelId`
- PUT `/channels/:channelId`

The folders after `src/services` : is the real path of the routes in the API except
folders starting and ending with `__` like `__test__` or `__utils__`.

The filenames correspond to the HTTP methods used (`get`, `post`, `put`, `delete`).
