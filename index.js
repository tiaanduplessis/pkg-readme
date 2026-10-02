'use strict'

const fs = require('fs')

const readPkgUp = require('read-pkg-up')

const template = require('./template')
const generateLicense = require('./license')

function generateReadme (opts = {}) {
  const cwd = process.cwd()
  return readPkgUp({ cwd }).then(result => {
    if (!result || !result.pkg) {
      throw new Error('Cannot generate README: no package.json found')
    }
    let config = Object.assign({}, result.pkg, opts)

    if (typeof opts.license === 'boolean') {
      config.license = result.pkg.license
    }

    config.example = config.example || 'example.js'
    config.example =
            config.example && config.example.length && fs.existsSync(config.example)
              ? fs.readFileSync(config.example, 'utf8')
              : ''

    const readme = template(config)
    if (opts.license === true) {
      const pkg = JSON.parse(fs.readFileSync(result.path, 'utf8'))
      generateLicense(pkg, opts, cwd)
    }
    return readme
  })
}

module.exports = generateReadme
