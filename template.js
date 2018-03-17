module.exports = function template (opts = {name: '', license: '', description: '', example: '', bin: false}) {
  return `
# ${opts.name}
[![package version](https://img.shields.io/npm/v/${opts.name}.svg?style=flat-square)](https://npmjs.org/package/${opts.name})
[![package downloads](https://img.shields.io/npm/dm/${opts.name}.svg?style=flat-square)](https://npmjs.org/package/${opts.name})
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/${opts.name}.svg?style=flat-square)](https://npmjs.org/package/${opts.name})
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> ${opts.description}

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#License)

## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com). 

\`\`\`sh
$ npm installl ${opts.name}
$ # OR
$ yarn add ${opts.name}
\`\`\`

## Usage

\`\`\`js
${opts.example}
\`\`\`
${opts.bin ? `
Using the CLI:

\`\`\`sh
$ 
\`\`\`

` : ''}
## Contribute

1. Fork it and create your feature branch: git checkout -b my-new-feature
2. Commit your changes: git commit -am 'Add some feature'
3.Push to the branch: git push origin my-new-feature 
4. Submit a pull request

## License

${opts.license}
    `
}