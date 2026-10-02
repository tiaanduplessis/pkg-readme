
# pkg-readme
[![package version](https://img.shields.io/npm/v/pkg-readme.svg?style=flat-square)](https://npmjs.org/package/pkg-readme)
[![package downloads](https://img.shields.io/npm/dm/pkg-readme.svg?style=flat-square)](https://npmjs.org/package/pkg-readme)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/pkg-readme.svg?style=flat-square)](https://npmjs.org/package/pkg-readme)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Generate a Standard Readme Style compliant README from your package.json

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#License)

## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com). 

```sh
$ npm install pkg-readme
$ # OR
$ yarn add pkg-readme
```

## Usage

```js
const generateReadme = require('./')

const args = {
  name: '', // Name of package
  description: '', // Description of package
  license: '', // Package license
  example: '' // name of example file in current directory that will be put into the usage section as code block
}

generateReadme(args)
  .then(console.log)
  .catch(console.error)

```

Using the CLI (Same options):

```sh
$ pkg-readme --license=FOOBAR
```

### Generate a LICENSE file

Pass the boolean `--license` flag to also create `LICENSE` in the current
directory, using the existing `license` and `author` fields in the nearest
`package.json`:

```sh
$ pkg-readme --license
$ pkg-readme --license --year=2020
```

The API equivalent is `generateReadme({ license: true, year: 2020 })`. It still
returns a Promise for the README string, and creates only the LICENSE file;
the CLI also writes README.md. Without `license: true`, the API writes no files.
An existing README is kept, and does not prevent generating a missing LICENSE.

- Supported license identifiers are exactly `MIT`, `ISC`, `BSD-2-Clause`, and
  `BSD-3-Clause`. Templates are bundled, so generation requires no network access.
- The license comes only from `package.json`. A string such as `--license=MIT`
  retains its original meaning: override the README's license text only.
  `--no-license` disables file generation and keeps the package's README license.
- Missing, unsupported, custom, legacy, or multiple-license declarations fail
  rather than choosing a license. Handle SPDX expressions such as
  `(MIT OR Apache-2.0)` manually.
- `author` must be a nonempty name, either an npm author string or an object with
  a `name` field. Email addresses and URLs in npm author strings are omitted.
- The copyright year defaults to the current UTC year. Use `--year=YYYY` (or
  `year` in the API) to provide a different four-digit year.
- Existing LICENSE, LICENCE, or COPYING files, including case variants and
  extensions, are never overwritten. Generation errors reject the API Promise
  and cause the CLI to exit with a nonzero status.

Review the generated copyright holder and year before distributing your project.
This option does not select a license or modify package.json. See
[template sources and notices](licenses/README.md) for attribution.

## Contribute

1. Fork it and create your feature branch: git checkout -b my-new-feature
2. Commit your changes: git commit -am 'Add some feature'
3. Push to the branch: git push origin my-new-feature 
4. Submit a pull request

## License

MIT
    
