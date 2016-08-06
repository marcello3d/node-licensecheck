/* global suite, test */

var assert = require('assert')
var path = require('path')

var licensecheck = require('../index.js')

suite('licensecheck')

function replacer (key, value) {
  return key === 'licenseFile' ? undefined : value
}
function removeLicenseFileKeys (object) {
  return JSON.parse(JSON.stringify(object, replacer))
}

test('licensecheck self', function () {
  assert.deepEqual(
    removeLicenseFileKeys(licensecheck('.', path.resolve(__dirname, '..'))),
    removeLicenseFileKeys(require('./self.json'))
  )
})

test('licensecheck --dev', function () {
  assert.deepEqual(
    removeLicenseFileKeys(licensecheck('.', path.resolve(__dirname, '..'), null, true)),
    removeLicenseFileKeys(require('./self-dev.json'))
  )
})

test('licensecheck mochajs', function () {
  assert.deepEqual(
    removeLicenseFileKeys(licensecheck('.', path.resolve(__dirname, '../node_modules/mocha'))),
    removeLicenseFileKeys(require('./mocha.json'))
  )
})
