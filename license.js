'use strict'

const fs = require('fs')
const path = require('path')

const supported = ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause']

module.exports = function generateLicense (pkg, opts, cwd) {
  // Refuse alternate spellings, extensions, directories and symlinks as well.
  const existing = fs.readdirSync(cwd).find(name => /^(.*[._-])?(licen[cs]es?|copying)([._-].*)?$/i.test(name))
  if (existing) {
    throw new Error(`Cannot generate LICENSE: ${existing} already exists`)
  }

  // Read the original package metadata, before README overrides or normalization.
  if (!pkg || typeof pkg.license !== 'string' || !supported.includes(pkg.license)) {
    throw new Error(`Cannot generate LICENSE: package.json must declare one supported license (${supported.join(', ')})`)
  }
  if (pkg.licenses !== undefined) {
    throw new Error('Cannot generate LICENSE: legacy or multiple licenses require manual review')
  }

  const author = typeof pkg.author === 'string'
    ? pkg.author.replace(/\s*<[^>]*>/g, '').replace(/\s*\([^)]*\)/g, '').trim()
    : pkg.author && pkg.author.name
  if (typeof author !== 'string' || !author.trim() || /[\r\n]/.test(author)) {
    throw new Error('Cannot generate LICENSE: package.json must declare an author name')
  }

  const year = opts.year === undefined ? new Date().getUTCFullYear() : opts.year
  if (!['string', 'number'].includes(typeof year) || !/^[1-9]\d{3}$/.test(String(year))) {
    throw new Error('Cannot generate LICENSE: year must be a four-digit year')
  }

  const source = fs.readFileSync(path.join(__dirname, 'licenses', `${pkg.license}.txt`), 'utf8')
  const text = source.replace(/\[year\]|\[fullname\]/g, placeholder => {
    return placeholder === '[year]' ? String(year) : author.trim()
  })
  // Exclusive creation also protects against another process creating LICENSE.
  fs.writeFileSync(path.join(cwd, 'LICENSE'), text, { flag: 'wx' })
}
