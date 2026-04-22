# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

To get started with the project, run `npm install` in the root directory to install the required dependencies:

```sh
npm install
```

This will also build the library automatically via the `prepare` script.

### Build

To build the library:

```sh
npm run build
```

To watch for changes during development:

```sh
npm run dev
```

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and type checking

We use [TypeScript](https://www.typescriptlang.org/) for type checking.

Make sure your code passes TypeScript checks:

```sh
npm run typecheck
```

### Publishing to npm

We use [release-it](https://github.com/release-it/release-it) to make it easier to publish new versions. It handles common tasks like bumping version based on semver, creating tags and releases, and generating a changelog.

To publish new versions, run the following:

```sh
npm run release
```

### Scripts

The `package.json` file contains various scripts for common tasks:

- `npm run build`: build the library for production.
- `npm run dev`: watch for changes and rebuild automatically.
- `npm run release`: bump version, create a git tag, and publish to npm.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that the build and type checks pass.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
