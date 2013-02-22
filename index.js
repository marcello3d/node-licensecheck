// Original based on https://github.com/shtylman/node-weaklink (with permission)

var fs = require('fs')
var path = require('path')

var licenseDir = __dirname+"/license-files/"

var licenses = []
function normalizeText(text) {
    return text.replace(/[^a-z0-9\s]/ig,'').toLowerCase().split(/[\s\n]+/).join(' ')
}
function matchLicense(licenseString) {
    var normalized = normalizeText(licenseString)
    for (var i=0; i<licenses.length; i++) {
        var license = licenses[i]
        if (normalized.indexOf(license.contents) >= 0) {
            return license.name
        }
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
    
    if (/license/i.test(readmeText)) {
        return matchLicense(readmeText)
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
        if (packageJson.license) licenses.push(packageJson.license)
        license = licenses.map(function(license) {
            return typeof license == 'string' ? license : (license.type + " (" + license.url + ")")
        }).join(', ')
    } else {
        // Look for file with "license" in its name
        var files = fs.readdirSync(basePath)
        files.some(function(name) {
            if (/license/i.test(name)) {
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