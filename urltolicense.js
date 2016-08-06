/**
 * Find license name from license url
 */

function getLicenseFromUrl (url) {
  var regex = {
    opensource: /(http(s)?:\/\/)?(www.)?opensource.org\/licenses\/([A-Za-z0-9\-._]+)$/,
    spdx: /(http(s)?:\/\/)?(www.)?spdx.org\/licenses\/([A-Za-z0-9\-._]+)$/
  }

  for (var re in regex) {
    var tokens = url.match(regex[re])

    if (tokens) {
      var license = tokens[tokens.length - 1]

      // remove .html, .php, etc. from license name
      var extensions = ['.html', '.php', '-license']
      for (var i in extensions) {
        if (license.slice(-extensions[i].length) === extensions[i]) {
          license = license.slice(0, -extensions[i].length)
        }
      }

      return license
    }
  }

  return false
}

module.exports = getLicenseFromUrl
