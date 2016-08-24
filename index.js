// Original based on https://github.com/shtylman/node-weaklink (with permission)

var fs = require('fs')
var path = require('path')
var markdown = require('markdown').markdown
var spdxLicenses = require('spdx-license-list/spdx-full')

var normalizeText = require('./normtext')

var licenseDir = path.join(__dirname, 'license-files')

var urltoLicense = require('./urltolicense')

// Alternate abbreviations used by package.json files.
var licenseAliases = {
  'BSD': 'BSD-2-Clause',
  'MIT/X11': 'MIT',
  'apache version 2.0': 'Apache-2.0'
}

var licenses = []

// Match a license body or license id against known set of licenses.
function matchLicense (licenseString) {
  // Find all textual matches on license text.
  var normalized = normalizeText(licenseString)
  var matchingLicenses = []

  var license

  // Check matches of normalized license content against signatures.
  for (var i = 0; i < licenses.length; i++) {
    license = licenses[i]
    var match = false
    for (var j = 0; j < license.signatures.length; j++) {
      if (normalized.indexOf(license.signatures[j]) >= 0) {
        match = true
        break
      }
    }
    if (match) {
      matchingLicenses.push(license)
    }
  }
  // For single-line license, check if it's a known license id.
  if (matchingLicenses.length === 0 && !/[\n\f\r]/.test(licenseString) && licenseString.length < 100) {
    var licenseName = normalizeText(licenseString)
    // If there's an extra "license" on the end of the name, drop it ("MIT License" -> "MIT").
    license = licenseIndex[licenseName] || licenseIndex[licenseName.replace(/ licen[sc]e$/, '')]
    if (!license) {
      license = {name: licenseName, id: null}
    }
    matchingLicenses.push(license)
  }
  if (matchingLicenses.length === 0) {
    return null
  }
  if (matchingLicenses.length > 1) {
    console.warn('Multiple matching licenses: ' + matchingLicenses.length, [licenseString, matchingLicenses])
  }
  return matchingLicenses[0]
}

// Attach "id" field to each license, and add a lookup for accidental variations among SPDX license ids.
var licenseIndex = {}
Object.keys(spdxLicenses).forEach(function (key) {
  var license = spdxLicenses[key]
  license.id = key
  license.signatures = [normalizeText(license.license)]
  if (license.url) {
    license.url = license.url.replace(/[\n\r\f]+/, ', ')
  }

  licenses.push(license)
  licenseIndex[key] = license
  licenseIndex[normalizeText(key)] = license
})

Object.keys(licenseAliases).forEach(function (alias) {
  licenseIndex[alias] = licenseIndex[licenseAliases[alias]]
  licenseIndex[normalizeText(alias)] = licenseIndex[licenseAliases[alias]]
})

// Read source licenses from license-files directory
fs.readdirSync(licenseDir).forEach(function (name) {
    // Add all variant signatures.
  var id = name.split(',')[0]
  if (licenseIndex[id]) {
    licenseIndex[id].signatures.push(normalizeText(fs.readFileSync(path.join(licenseDir, name), 'utf8')))
  } else {
    console.warn('Unrecognized license for signature: ' + name)
  }
})

// Convert package.json format to a known license.
// If a developer specifies just the name, we check it against SPDX, according to NPM guidelines.
// If they supply a URL, we just link to it, preserving name and exact link.
function getJsonLicense (json) {
  var license = 'nomatch'
  if (typeof json === 'string') {
    license = matchLicense(json) || 'nomatch'
  } else {
    if (json.url) {
      license = { name: json.type, url: json.url }
    } else {
      license = matchLicense(json.type)
    }
  }
  return license
}

function getFileLicense (filename) {
  var fileContents = fs.readFileSync(filename, 'utf8')
  return matchLicense(fileContents) || 'nomatch'
}

function getReadmeLicense (filename) {
  var readmeText = fs.readFileSync(filename, 'utf8')

  if (/\.(md|markdown)$/i.test(filename)) {
    return parseMarkdownLicense(readmeText)
  }

  if (/licen[cs]e/i.test(readmeText)) {
    return matchLicense(readmeText)
  }

  return null
}

function parseMarkdownLicense (markdownText) {
  var license = getMarkdownLicenseSection(markdownText)
  return (
    license
    ? (matchLicense(license) || 'nomatch')
    : matchLicense(markdownText)
  )
}
function getMarkdownLicenseSection (text) {
  // Parse as markdown
  var tree = markdown.parse(text)
  for (var i = 0; i < tree.length; i++) {
    var node = tree[i]

    // Find section with "License" in the name
    if (node[0] === 'header' && /licen[cs]e/i.test(node[2])) {
      var section = []
      // Group together all paragraph nodes immediately after the header
      for (var j = i + 1; j < tree.length; j++) {
        var childNode = tree[j]
        if (childNode[0] === 'para') {
          section.push(childNode[1])
        } else {
          break
        }
      }
      // If we got a license, return it
      if (section.length) {
        return section.join('\n\n')
      }
      // Otherwise consider using the header contents itself (e.g. "MIT License")
      if (/.+licen[cs]e/i.test(node[2])) {
        return node[2]
      }
    }
    // Check if paragraph has 'license' in it, and use it as-is
    if (node[0] === 'para' && /.+licen[cs]e/i.test(node[1])) {
      return node[1]
    }
  }
  return null
}

function formatLicense (license) {
  if (typeof license === 'string') {
    return license
  }
  if (license.name && license.url) {
    return license.name + ' (' + license.url + ')'
  }
  if (license.name && license.id) {
    return license.name + ' (' + 'https://spdx.org/licenses/' + license.id + ')'
  }
  if (license.name) {
    return license.name
  }
  if (license.url) {
    var licensename = urltoLicense(license.url)
    if (licensename) {
      return licensename + ' (' + license.url + ')'
    }
    return 'unknown' + ' (' + license.url + ')'
  }
  return 'unknown license'
}

module.exports = function checkPath (packageName, basePath, overrides, includeDevDependencies, includeOptDependencies, seenList) {
  seenList = seenList || {}
  var seenKey = basePath + '|' + packageName
  if (seenList[seenKey]) {
    return
  }
  seenList[seenKey] = true
  if (!fs.existsSync(basePath)) {
    const parentNodeModules = path.join(path.resolve(basePath, '../../../node_modules'), packageName)
    if (parentNodeModules !== basePath) {
      return checkPath(packageName, parentNodeModules, overrides, includeDevDependencies, includeOptDependencies, seenList)
    }
    return null
  }

  var packageJsonPath = path.join(basePath, 'package.json')

  var packageJson = JSON.parse(fs.readFileSync(packageJsonPath))

  if (overrides && overrides[packageName]) {
    var override = overrides[packageName]
    var licenseOverride = matchLicense(override.license)
    return {
      name: packageName,
      version: packageJson.version,
      license: formatLicense(licenseOverride),
      licenseFile: override.url,
      deps: []
    }
  }

  var license = 'unknown'
  var licenseFilePath

  // Check package.json for "license" or "licenses" fields
  if (packageJson.license || packageJson.licenses) {
    licenseFilePath = packageJsonPath
    var licenses = packageJson.licenses || []
    if (!Array.isArray(licenses)) {
      // Bad JSON, using "licenses" not as an array
      licenses = [licenses]
    }
    if (Array.isArray(packageJson.license)) {
      // Bad JSON, using "license" as an array
      licenses = licenses.concat(packageJson.license)
    } else if (packageJson.license) {
      licenses.push(packageJson.license)
    }
    license = licenses.map(getJsonLicense).map(formatLicense).join(', ')
  } else {
    // Look for file with "license" or "copying" in its name
    var files = fs.readdirSync(basePath)
    files.some(function (name) {
      if (/licen[sc]e/i.test(name) || /copying.*/i.test(name)) {
        var file = path.join(basePath, name)
        if (fs.statSync(file).isFile()) {
          license = formatLicense(getFileLicense(file))
          licenseFilePath = file
          return true
        }
      }
      return false
    })
    if (!licenseFilePath) {
      // Look for a readme file that might have a license in it
      files.some(function (name) {
        if (/^readme/i.test(name)) {
          var file = path.join(basePath, name)
          if (fs.statSync(file).isFile()) {
            var result = getReadmeLicense(file)
            if (result) {
              license = formatLicense(result)
              licenseFilePath = file
              return license !== 'nomatch'
            }
          }
        }
        return false
      })
    }
  }

  // array of deps
  var dependencies = []
  var pushDependency = function (dependencyLevel) {
    return function (name) {
      var res = checkPath(name, path.join(basePath, 'node_modules', name), overrides, includeDevDependencies, includeOptDependencies, seenList)
      if (res) {
        res.name = name
        res.deps = res.deps || []
        res.depLevel = dependencyLevel
        dependencies.push(res)
      }
    }
  }

  Object.keys(packageJson.dependencies || {}).forEach(pushDependency(''))
  if (includeDevDependencies || false) {
    Object.keys(packageJson.devDependencies || {}).forEach(pushDependency('Dev'))
  }

  if (includeOptDependencies || false) {
    Object.keys(packageJson.optionalDependencies || {}).forEach(pushDependency('Opt'))
  }

  return {
    name: packageJson.name,
    version: packageJson.version,
    license: license,
    licenseFile: licenseFilePath && path.relative(process.cwd(), licenseFilePath),
    deps: dependencies.sort(function (dep1, dep2) { return dep1.name.localeCompare(dep2.name) })
  }
}
