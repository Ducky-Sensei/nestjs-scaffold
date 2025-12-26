module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat', // New feature
                'bug', // Bug fix
                'docs', // Documentation changes
                'style', // Code style changes (formatting, etc)
                'refactor', // Code refactoring
                'perf', // Performance improvements
                'test', // Adding or updating tests
                'build', // Build system or dependencies
                'ci', // CI configuration changes
                'chore', // Other changes (maintenance)
                'revert', // Revert previous commit
            ],
        ],
    },
};
