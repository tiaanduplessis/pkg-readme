#! /usr/bin/env node

const path = require('path')
const fs = require('fs')

const args = require('get-them-args')()

const generateReadme = require('./')

generateReadme(args)
  .then(str => {
    const uri = path.join(process.cwd(), 'README.md')

    if (fs.existsSync(uri)) {
      console.log('README already exists!')
      return
    }

    fs.writeFileSync(uri, str, { flag: 'wx' })
    console.log('🎉 Done generating README.md!')
  })
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
