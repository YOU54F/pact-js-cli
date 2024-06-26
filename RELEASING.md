<img src="https://raw.githubusercontent.com/pact-foundation/pact-logo/master/media/logo-black.png" width="200">

# Releasing

We use Github Actions for releases.

## How a release works

Releases trigger when the repository recieves the custom repository_dispatch event
`release-triggered`.

This triggers the `publish.yml` workflow, which in turn
triggers the `release.sh` script in `scripts/ci`.
The workflow will also create a github release with an appropriate changelog.

Having the release triggered by a custom event is useful for automating
releases in the future (eg for version bumps in pact dependencies).

### Release.sh

This script is not intended to be run locally. Note that it modifies your git
settings.

The script will:

- Modify git authorship settings
- Confirm that there would be changes in the changelog after release
- Run Lint
- Run Build
- Run Test
- Commit an appropriate version bump, changelog and tag
- Package and publish to npm
- Push the new commit and tag back to the main branch.

Should you need to modify the script locally, you will find it uses some
dependencies in `scripts/ci/lib`.

## Kicking off a release

You must be able to create a github access token with `repo` scope to the
pact-cli repository.

- Set an environment variable `GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES` to this token.
- Make sure main contains the code you want to release
- Run `scripts/trigger-release.sh`

Then wait for github to do its magic. It will release the current head of main.

Note that the release script refuses to publish anything that wouldn't
produce a changelog. Please make sure your commits follow the guidelines in
`CONTRIBUTING.md`

## If the release fails

The publish is the second to last step, so if the release fails, you don't
need to do any rollbacks.

However, there is a potential for the push to fail _after_ a publish if there
are new commits to main since the release started. This is unlikely with
the current commit frequency, but could still happen. Check the logs to
determine if npm has a version that doesn't exist in the main branch.

If this has happened, you will need to manually put the release commit in.

```
npm run release # This tags, commits and updates the changelog only
```

Depending on the nature of the new commits to main after the release, you
may need to rebase them on top of the tagged release commit and force push.

## Releasing Pact CLI Manually

If any changes needs to be released, let it be dependencies or code, you must have access to push directly to main on the pact-cli repo, then follow these steps:

 - Run `npm ci` to confirm that the dependencies are appropriately configured.
 - Run `npm test` first to make sure all tests pass. This will also build and download the appropriate checksums.
 - Run `npm run release` to generate the changelog and create a tagged commit
 - Run `npm publish --access public --tag latest` to publish to npm.
 - Push the commit and the tag to the origin using `git push --follow-tags`
