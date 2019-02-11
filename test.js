const pkgReadme = require('./index')

test('should be a function', () => {
  expect(typeof pkgReadme).toBe('function')
})

test('should generate a README string', async () => {
  const str = await pkgReadme({ name: 'foo', description: 'bar' })
  expect(str).toContain('foo')
  expect(str).toContain('bar')
})
