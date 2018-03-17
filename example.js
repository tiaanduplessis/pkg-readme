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
