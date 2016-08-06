/**
 * Normalize text for matching purposes.
 * Preserve only alphanumeric words and periods inside words.
 * "UIUC/NCSA " -> "uiuc ncsa"
 * "Apache-2.0" and "Apache 2.0" -> "apache 2.0"
 * "MIT License." -> "mit license"
 */
module.exports = function (text) {
  return text.toLowerCase().match(/[a-z0-9]([a-z0-9.]*[a-z0-9])?/ig).join(' ')
}
