# Nightly CLI

An unofficial CLI for the [Changelog Nightly](https://changelog.com/nightly) newsletter.

![demo](./demo.gif)

## Installation

```sh
# clone
gh repo clone adamelliotfields/nightly-cli

# install
npm i -g ./nightly-cli
```

## Usage

```
Usage: nightly [options] [date]

Unofficial CLI for Changelog Nightly

Arguments:
  date                  YYYYMMDD, YYYY-MM-DD, or YYYY/MM/DD

Options:
  -v, --version         output the version number
  -l, --limit <number>  limit number of repos displayed
  --no-color            disable ANSI colors in output
  -h, --help            display help for command

Examples:
  nightly               Show most recent trending repos
  nightly 20250115      Show repos for January 15, 2025
  nightly 2025-01-15    Same, with dashes
  nightly 2025/01/15    Same, with slashes
  nightly -l 5          Limit output to 5 repos
```

## Minimum Supported Node Version

Requires [22.18.0](https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V22.md#22.18.0) for TypeScript.

Requires [25.5.0](https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V25.md#25.5.0) for `--build-sea` (optional).
