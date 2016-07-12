/**
 * Find license name from license url
 */

// Check if url is an opensource.org license url
function isopensourceorgLicense(url) {
  var re = /(http(s)?\:\/\/)?(www.)?opensource.org\/licenses\/([A-Za-z0-9]|[\-\.\_])+$/
  return url.match(re)
}

// Find and return license name from opensource.org url
function getopensourceorgLicense(url) {
  var licensenames = {
    "mit-license.php": "MIT",
    "gpl-license": "GPL",
    "lgpl-license": "LGPL"
  }

  var array = url.split("/");
  var license = array[array.length - 1];

  if (license in licensenames)
    return licensenames[license];
  else
    return license;
}

// Find license name from
module.exports = function (url) {

  if (isopensourceorgLicense(url))
    return getopensourceorgLicense(url);

  else
    return "unknown"
}
