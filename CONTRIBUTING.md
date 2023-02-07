# Contributing

This contributing guide is meant for internal LinkedIn maintainers. We are not currently accepting contributions from outside of LinkedIn at this time. If you are not a LinkedIn engineer, we appreciate your interest in our library and encourage you to provide bug reports or suggestions by opening an issue in the GitHub repo.

## Commit Messages

Please follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)

## Documentation

Make sure the documentation is consistent with any code changes in the same PR.

## Examples

If there are code changes that might affect the example code ([/examples](examples/)), ensure each example runs correctly, or update accordingly.

Note that example scripts use the built code in /dist, so if you have local changes that aren't being reflected, make sure to run `npm install` from inside the /examples directory to ensure the client code is up-to-date.

## Testing

Ensure tests pass by running `npm run test`. Tests are also run in different node environments when a PR is created.

## Release

### Pre-requisites

To release and publish a new version of the library, you must have Write access to the repo and be an owner on the published npm package (`npm owner ls linkedin-api-client`).

### Steps

1. Obtain a GitHub [personal access token](https://github.com/settings/tokens/new?scopes=repo&description=release-it)
2. Put the token in a `.env` file at the root of the project. For example: `GITHUB_TOKEN="ghp_7e3..."`
3. From the master branch on a clean working directory, run the following, specifying the semver increment.
    ```sh
    npm run release -- <increment>

    # Example
    npm run release -- minor
    ```
   1. This will have terminal prompts to confirm various release details. After confirmation, the following will happen:
      1. The `package.json` version will be updated
      2. The `CHANGELOG.md` will be automatically updated
      3. The modified files will be committed, and the commit will be tagged with the release version
      4. Commit will be pushed to the remote branch
      5. A GitHub release will be automatically created based on the tagged commit
4. For now, the actual publishing of the package to NPM is done as a separate step (you may need to `npm login` first):
    ```sh
    npm publish
    ```