# Contributing Guide

## Development Workflow

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Create a feature branch: `git checkout -b feat/your-feature`
4. Make your changes
5. Run tests: `pnpm test`
6. Run linting: `pnpm lint:fix`
7. Commit with conventional commits
8. Push and create a pull request

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes

### Examples

```
feat(auth): add OAuth2 login support

fix(products): resolve duplicate key issue in product list

docs(readme): update installation instructions

test(auth): add E2E tests for login flow
```

## Code Style

- Use Biome for linting and formatting
- Follow TypeScript strict mode
- Use functional components with hooks
- Keep components small and focused
- Write meaningful comments for complex logic

## Testing Requirements

- All new features must include tests
- Maintain >80% code coverage
- E2E tests for critical user flows
- Component tests for UI components

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update the CHANGELOG.md
4. Request review from maintainers
5. Address review feedback
6. Squash commits if needed

## Code Review Guidelines

- Be respectful and constructive
- Focus on code quality and best practices
- Test the changes locally
- Approve only when all concerns addressed

## Questions?

Open an issue or discussion for any questions!
