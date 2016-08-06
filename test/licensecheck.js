/* global suite, test */

var assert = require('assert')
var path = require('path')

var licensecheck = require('../index.js')

suite('licensecheck')

test('licensecheck self', function () {
  assert.deepEqual(
    licensecheck('.', path.resolve(__dirname, '..')),
    require('./self.json')
  )
})

test('licensecheck --dev', function () {
  assert.deepEqual(
    licensecheck('.', path.resolve(__dirname, '..'), null, true),
    require('./self-dev.json')
  )
})

test('licensecheck mochajs', function () {
  assert.deepEqual(
    licensecheck('.', path.resolve(__dirname, '../node_modules/mocha')),
    require('./mocha.json')
  )
})
