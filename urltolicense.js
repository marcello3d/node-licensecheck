/**
 * Find license name from license url
 */

var urls = {
  "https://opensource.org/licenses/Apache-2.0"  : "Apache-2.0",
  "https://opensource.org/licenses/BSD-3-Clause": "BSD-3-Clause",
  "https://opensource.org/licenses/BSD-2-Clause": "BSD-2-Clause",
  "https://opensource.org/licenses/MIT"         : "MIT",
  "https://opensource.org/licenses/GPL-2.0"     : "GPL-2.0",
  "https://opensource.org/licenses/GPL-3.0"     : "GPL-3.0",
  "https://opensource.org/licenses/LGPL-2.1"    : "LGPL-2.1",
  "https://opensource.org/licenses/LGPL-3.0"    : "LGPL-3.0",
  "https://opensource.org/licenses/MPL-2.0"     : "MPL-2.0",
  "https://opensource.org/licenses/CDDL-1.0"    : "CDDL-1.0",
  "https://opensource.org/licenses/EPL-1.0"     : "EPL-1.0",
  "http://opensource.org/licenses/Apache-2.0"  : "Apache-2.0",
  "http://opensource.org/licenses/BSD-3-Clause": "BSD-3-Clause",
  "http://opensource.org/licenses/BSD-2-Clause": "BSD-2-Clause",
  "http://opensource.org/licenses/mit-license.php" : "MIT",
  "http://opensource.org/licenses/MIT"         : "MIT",
  "http://opensource.org/licenses/GPL-2.0"     : "GPL-2.0",
  "http://opensource.org/licenses/GPL-3.0"     : "GPL-3.0",
  "http://opensource.org/licenses/LGPL-2.1"    : "LGPL-2.1",
  "http://opensource.org/licenses/LGPL-3.0"    : "LGPL-3.0",
  "http://opensource.org/licenses/MPL-2.0"     : "MPL-2.0",
  "http://opensource.org/licenses/CDDL-1.0"    : "CDDL-1.0",
  "http://opensource.org/licenses/EPL-1.0"     : "EPL-1.0",
  "http://www.opensource.org/licenses/mit-license.php" : "MIT",
  "https://www.opensource.org/licenses/mit-license.php" : "MIT"
}

module.exports = function (url) {
  if (url in urls)
    return urls[url];
  else
    return false;
}
