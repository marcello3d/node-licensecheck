// Original based on https://github.com/shtylman/node-weaklink (with permission)

var fs = require('fs')
var path = require('path')
var markdown = require('markdown').markdown

var licenseDir = __dirname+"/license-files/"

var licenses = []
function normalizeText(text) {
    return text.replace(/[^a-z0-9\s]/ig,'').toLowerCase().trim().split(/[\s\n]+/).join(' ')
}
function matchLicense(licenseString) {
    var normalized = normalizeText(licenseString)
    for (var i=0; i<licenses.length; i++) {
        var license = licenses[i]
        if (normalized.indexOf(license.contents) >= 0) {
            return license.name
        }
    }
    if (!/[\n\f\r]/.test(licenseString) && licenseString.length < 100) {
        return licenseString.trim()
    }
    return null
}

// Read source licenses from license-files directory
fs.readdirSync(licenseDir).forEach(function(name) {
    licenses.push({
        name:name,
        contents:normalizeText(fs.readFileSync(licenseDir + name, "utf8"))
    })
})

function getLicenseType(filename) {
    var fileContents = fs.readFileSync(filename, "utf8")
    return matchLicense(fileContents) || 'nomatch'
}

function getReadmeLicense(filename) {
    var readmeText = fs.readFileSync(filename, "utf8")

    if (/\.(md|markdown)$/i.test(filename)) {
        return parseMarkdownLicense(readmeText)
    }

    if (/licen[cs]e/i.test(readmeText)) {
        return matchLicense(readmeText)
    }
    
    return null
}

function parseMarkdownLicense(markdownText) {
    var license = getMarkdownLicenseSection(markdownText)
    return license ?
        (matchLicense(license) || 'nomatch')
        : matchLicense(markdownText)
}
function getMarkdownLicenseSection(text) {
    // Parse as markdown
    var tree = markdown.parse(text)
    for (var i=0; i<tree.length; i++) {
        var node = tree[i]

        // Find section with "License" in the name
        if (node[0] == 'header' && /licen[cs]e/i.test(node[2])) {
            var section = []
            // Group together all paragraph nodes immediately after the header
            for (var j=i+1; j<tree.length; j++) {
                var childNode = tree[j]
                if (childNode[0] == 'para') {
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
        if (node[0] == 'para' && /.+licen[cs]e/i.test(node[1])) {
            return node[1]
        }
    }
    return null
}

module.exports = function checkPath(basePath) {
    if (!fs.existsSync(basePath))  return null

    var packageJsonPath = path.join(basePath, 'package.json')

    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath))
    
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
        if (packageJson.license) {
            licenses.push(packageJson.license)
        }
        license = licenses.map(function(license) {
            return typeof license == 'string' || !license.url ? license : (license.type + " (" + license.url + ")")
        }).join(', ')
    } else {
        // Look for file with "license" or "copying" in its name
        var files = fs.readdirSync(basePath)
        files.some(function(name) {
            if (/licen[sc]e/i.test(name) || /copying.*/i.test(name)) {
                var file = path.join(basePath, name)
                if (fs.statSync(file).isFile()) {
                    license = getLicenseType(file)
                    licenseFilePath = file
                    return true
                }
            }
            return false
        })
        if (!licenseFilePath) {
            // Look for a readme file that might have a license in it
            files.some(function(name) {
                if (/^readme/i.test(name)) {
                    var file = path.join(basePath, name)
                    if (fs.statSync(file).isFile()) {
                        var result = getReadmeLicense(file)
                        if (result) {
                            license = result
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

    Object.keys(packageJson.dependencies || {}).sort().forEach(function(name) {
        var res = checkPath(path.join(basePath, 'node_modules', name))
        if (res) {
            res.name = name
            res.deps = res.deps || []
            dependencies.push(res)
        }
    })

    return {
        name: packageJson.name,
        version: packageJson.version,
        license: license,
        licenseFile: licenseFilePath,
        deps: dependencies
    }
}
