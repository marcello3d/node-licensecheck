/* global suite, test */

var assert = require('assert')

var normalizeText = require('../normtext.js')

suite('normtext.js')

test('normalizeText', function () {
  assert.equal(
      'my hybrid ambiguous made up uiuc ncsa apache 2.0 or apache 2.0 license',
      normalizeText(' My hybrid,  (ambiguous!) made-up UIUC/NCSA Apache 2.0 (or Apache-2.0) license.')
    )
})
