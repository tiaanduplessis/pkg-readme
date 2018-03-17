'use strict'

const fs = require('fs')

const readPkgUp = require('read-pkg-up')

const template = require('./template')

function generateReadme (opts = {}) {
  return readPkgUp().then(result => {
    let config = Object.assign({}, result.pkg, opts)

    config.example = config.example || 'example.js'
    config.example =
            config.example && config.example.length && fs.existsSync(config.example)
              ? fs.readFileSync(config.example, 'utf8')
              : ''

    return template(config)
  })
}

module.exports = generateReadme
