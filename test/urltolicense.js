/* global suite, test */

var assert = require('assert')

var urltolicense = require('../urltolicense')

suite('urltolicense')

function testLicense (name, url) {
  test(name, function () {
    assert.equal(name, urltolicense(url))
  })
}

testLicense('MIT', 'http://www.opensource.org/licenses/MIT')
testLicense('APACHE-2.0', 'http://opensource.org/licenses/APACHE-2.0')
testLicense('EPL-1.0', 'https://www.opensource.org/licenses/EPL-1.0')
testLicense('Zlib', 'https://opensource.org/licenses/Zlib')
testLicense('BSD-3-Clause', 'www.opensource.org/licenses/BSD-3-Clause')
testLicense('ISC', 'opensource.org/licenses/ISC')
testLicense('mit', 'http://www.opensource.org/licenses/mit-license.php')
testLicense('lgpl', 'http://www.opensource.org/licenses/lgpl-license')

testLicense('Apache-2.0', 'http://spdx.org/licenses/Apache-2.0.html')
testLicense('Apache-2.0', 'https://spdx.org/licenses/Apache-2.0.html')
testLicense('MIT', 'http://www.spdx.org/licenses/MIT.html')
testLicense('MIT', 'https://www.spdx.org/licenses/MIT.html')
testLicense('Apache-2.0', 'https://www.spdx.org/licenses/Apache-2.0')
