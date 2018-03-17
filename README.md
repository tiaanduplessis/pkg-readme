
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
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#License)

## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com). 

```sh
$ npm installl pkg-readme
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

## Contribute

1. Fork it and create your feature branch: git checkout -b my-new-feature
2. Commit your changes: git commit -am 'Add some feature'
3.Push to the branch: git push origin my-new-feature 
4. Submit a pull request

## License

MIT
    