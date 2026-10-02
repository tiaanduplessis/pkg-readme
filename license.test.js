const fs = require('fs')
const os = require('os')
const path = require('path')
const childProcess = require('child_process')
const generateReadme = require('./')
const generateLicense = require('./license')

const originalCwd = process.cwd()
const cli = path.join(__dirname, 'cli.js')
let cwd

function removeDirectory (directory) {
  fs.readdirSync(directory).forEach(name => {
    const file = path.join(directory, name)
    if (fs.lstatSync(file).isDirectory()) removeDirectory(file)
    else fs.unlinkSync(file)
  })
  fs.rmdirSync(directory)
}

function writePackage (overrides = {}) {
  const pkg = Object.assign({ name: 'example-package', version: '1.0.0', license: 'MIT', author: 'Example Author' }, overrides)
  fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(pkg))
  return pkg
}

function runCli (args = []) {
  return childProcess.spawnSync(process.execPath, [cli].concat(args), { cwd, encoding: 'utf8' })
}

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-readme-test-'))
  process.chdir(cwd)
  writePackage()
})

afterEach(() => {
  jest.restoreAllMocks()
  process.chdir(originalCwd)
  removeDirectory(cwd)
})

test('normal API usage returns README text without writing files', async () => {
  const str = await generateReadme()
  expect(str).toContain('example-package')
  expect(str).toContain('MIT')
  expect(fs.readdirSync(cwd)).toEqual(['package.json'])
})

test.each(['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause'])('generates the exact bundled %s template', async license => {
  writePackage({ license })
  const before = fs.readFileSync('package.json', 'utf8')
  const readme = await generateReadme({ license: true, year: 2020 })
  const source = fs.readFileSync(path.join(__dirname, 'licenses', `${license}.txt`), 'utf8')
  expect(fs.readFileSync('LICENSE', 'utf8')).toBe(source.replace('[year]', '2020').replace('[fullname]', 'Example Author'))
  expect(fs.readFileSync('package.json', 'utf8')).toBe(before)
  expect(readme).toContain(`\n${license} `)
  expect(fs.existsSync('README.md')).toBe(false)
})

test.each([
  ['Example Author <author@example.com> (https://example.com)', 'Example Author'],
  [{ name: 'Example Organization', email: 'author@example.com', url: 'https://example.com' }, 'Example Organization'],
  [{ name: '$& [year] Author' }, '$& [year] Author']
])('uses the declared author name without contact details or replacement expansion', async (author, expected) => {
  writePackage({ author })
  await generateReadme({ license: true, year: '2020' })
  expect(fs.readFileSync('LICENSE', 'utf8')).toContain(`Copyright (c) 2020 ${expected}\n`)
  expect(fs.readFileSync('LICENSE', 'utf8')).not.toContain('author@example.com')
})

test('defaults to the current UTC year', async () => {
  const year = new Date().getUTCFullYear()
  await generateReadme({ license: true })
  expect(fs.readFileSync('LICENSE', 'utf8')).toContain(`Copyright (c) ${year} Example Author`)
})

test.each([undefined, null, '', 'Unlicense', 'Apache-2.0', 'UNLICENSED', 'SEE LICENSE IN NOTICE', '(MIT OR ISC)', 'MIT AND ISC', 'MIT WITH LLVM-exception', { type: 'MIT' }, ['MIT', 'ISC'], 'mit', '../MIT'].map(value => [value]))('rejects unsupported or ambiguous metadata: %j', async license => {
  writePackage({ license })
  await expect(generateReadme({ license: true })).rejects.toThrow(/one supported license/)
  expect(fs.readdirSync(cwd)).toEqual(['package.json'])
})

test('rejects legacy multiple-license metadata even alongside a supported license', async () => {
  writePackage({ licenses: [{ type: 'MIT' }, { type: 'ISC' }] })
  await expect(generateReadme({ license: true })).rejects.toThrow(/manual review/)
  expect(fs.existsSync('LICENSE')).toBe(false)
})

test.each([undefined, null, '', '   ', '<author@example.com>', {}, { name: '' }, { name: 42 }, 'First\nSecond'])('rejects a missing or invalid author: %j', async author => {
  writePackage({ author })
  await expect(generateReadme({ license: true })).rejects.toThrow(/author name/)
  expect(fs.existsSync('LICENSE')).toBe(false)
})

test.each([null, '', true, [], [2020], {}, 0, 20, 10000, '2020-2021', '2020\nAuthor', 2020.5].map(value => [value]))('rejects an invalid year: %j', async year => {
  await expect(generateReadme({ license: true, year })).rejects.toThrow(/four-digit year/)
  expect(fs.existsSync('LICENSE')).toBe(false)
})

test.each(['LICENSE', 'license', 'LICENSE.md', 'Licence.txt', 'COPYING', 'COPYING.LESSER', 'MIT-LICENSE', 'LICENSE-MIT'])('preserves existing %s', async filename => {
  fs.writeFileSync(filename, 'existing terms')
  await expect(generateReadme({ license: true })).rejects.toThrow(/already exists/)
  expect(fs.readFileSync(filename, 'utf8')).toBe('existing terms')
  if (filename !== 'LICENSE') expect(fs.existsSync('LICENSE')).toBe(false)
})

test('preserves an existing LICENSE symlink and its target', async () => {
  fs.writeFileSync('target', 'existing terms')
  fs.symlinkSync('target', 'LICENSE')
  await expect(generateReadme({ license: true })).rejects.toThrow(/already exists/)
  expect(fs.lstatSync('LICENSE').isSymbolicLink()).toBe(true)
  expect(fs.readFileSync('target', 'utf8')).toBe('existing terms')
})

test('preserves a dangling LICENSE symlink', async () => {
  fs.symlinkSync('missing', 'LICENSE')
  await expect(generateReadme({ license: true })).rejects.toThrow(/already exists/)
  expect(fs.lstatSync('LICENSE').isSymbolicLink()).toBe(true)
  expect(fs.existsSync('missing')).toBe(false)
})

test('preserves an existing licenses directory', async () => {
  fs.mkdirSync('licenses')
  await expect(generateReadme({ license: true })).rejects.toThrow(/already exists/)
  expect(fs.statSync('licenses').isDirectory()).toBe(true)
})

test('exclusive creation preserves a LICENSE created after the directory check', () => {
  const pkg = writePackage()
  const readDirectory = fs.readdirSync
  jest.spyOn(fs, 'readdirSync').mockImplementation(directory => {
    const entries = readDirectory(directory)
    fs.writeFileSync(path.join(directory, 'LICENSE'), 'created concurrently')
    return entries
  })
  expect(() => generateLicense(pkg, {}, cwd)).toThrow(/EEXIST/)
  expect(fs.readFileSync('LICENSE', 'utf8')).toBe('created concurrently')
})

test('propagates write permission errors without creating a file', async () => {
  const error = Object.assign(new Error('permission denied'), { code: 'EACCES' })
  jest.spyOn(fs, 'writeFileSync').mockImplementation(() => { throw error })
  await expect(generateReadme({ license: true })).rejects.toBe(error)
  expect(fs.existsSync('LICENSE')).toBe(false)
})

test('uses the nearest package.json while writing in the invocation directory', async () => {
  fs.mkdirSync('child')
  process.chdir('child')
  await generateReadme({ license: true })
  expect(fs.existsSync('LICENSE')).toBe(true)
  expect(fs.existsSync(path.join(cwd, 'LICENSE'))).toBe(false)
})

test('a README license override never creates or changes license metadata', async () => {
  const before = fs.readFileSync('package.json', 'utf8')
  expect(await generateReadme({ license: 'FOOBAR' })).toContain('\nFOOBAR ')
  expect(fs.existsSync('LICENSE')).toBe(false)
  expect(fs.readFileSync('package.json', 'utf8')).toBe(before)
})

test('false disables license generation without changing README license text', async () => {
  expect(await generateReadme({ license: false })).toContain('\nMIT ')
  expect(fs.existsSync('LICENSE')).toBe(false)
})

test('CLI opts in to generation of both README and LICENSE', () => {
  const result = runCli(['--license', '--year=2020'])
  expect(result.status).toBe(0)
  expect(fs.readFileSync('README.md', 'utf8')).toContain('\nMIT ')
  expect(fs.readFileSync('LICENSE', 'utf8')).toContain('Copyright (c) 2020 Example Author')
})

test('CLI preserves an existing README while generating a missing LICENSE', () => {
  fs.writeFileSync('README.md', 'existing documentation')
  const result = runCli(['--license'])
  expect(result.status).toBe(0)
  expect(fs.readFileSync('README.md', 'utf8')).toBe('existing documentation')
  expect(fs.existsSync('LICENSE')).toBe(true)
})

test.each([[], ['--no-license'], ['--license=FOOBAR']].map(value => [value]))('CLI stays opt-in with %j', args => {
  const result = runCli(args)
  expect(result.status).toBe(0)
  expect(fs.existsSync('README.md')).toBe(true)
  expect(fs.existsSync('LICENSE')).toBe(false)
})

test('CLI reports an unsupported license with a failing exit code and no writes', () => {
  writePackage({ license: 'Apache-2.0' })
  const result = runCli(['--license'])
  expect(result.status).toBe(1)
  expect(result.stderr).toMatch(/one supported license/)
  expect(fs.readdirSync(cwd)).toEqual(['package.json'])
})

test('CLI fails without overwriting an existing LICENSE or creating a README', () => {
  fs.writeFileSync('LICENSE', 'existing terms')
  const result = runCli(['--license'])
  expect(result.status).toBe(1)
  expect(result.stderr).toMatch(/already exists/)
  expect(fs.readFileSync('LICENSE', 'utf8')).toBe('existing terms')
  expect(fs.existsSync('README.md')).toBe(false)
})
