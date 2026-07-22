# Copilot Instructions for lowerpalisades.org

## Git Push Authentication

This repo (`njason/lowerpalisades.org`) requires push access via the **goldy267** GitHub account. The default credential manager may serve a different token (e.g. `algoldsc_microsoft`) which will get a 403.

To push, bypass the cached credential helper:

```sh
git -c credential.helper="" -c credential.helper="manager" push https://goldy267@github.com/njason/lowerpalisades.org.git <local-branch>:<remote-branch>
```

For pushing a feature branch to main:

```sh
git -c credential.helper="" -c credential.helper="manager" push https://goldy267@github.com/njason/lowerpalisades.org.git <branch>:main
```

## Deployment

GitHub Pages is configured to deploy from the `main` branch root. Pushing to `main` triggers an automatic deployment.

Live site: https://njason.github.io/lowerpalisades.org/
