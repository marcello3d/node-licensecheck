// Based on code shamelessly lifted from https://github.com/shtylman/node-weaklink (with permission)

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
    return 'nomatch'
}

fs.readdirSync(licenseDir).forEach(function(name) {
    licenses.push({
        name:name,
        contents:normalizeText(fs.readFileSync(licenseDir + name, "utf8"))
    })
})

function getLicenseType(filename) {
    var fileContents = fs.readFileSync(filename, "utf8")
    return matchLicense(fileContents)
}

function getReadmeLicense(filename) {
    var readmeText = fs.readFileSync(filename, "utf8")
    
    if (/license/i.test(readmeText)) {
        return matchLicense(readmeText)
    }
    
    return null
}

module.exports = function checkPath(proj_path) {
    if (!fs.existsSync(proj_path)) {
        return null
    }

    var pkg_path = path.join(proj_path, 'package.json')

    var pkg_info = JSON.parse(fs.readFileSync(pkg_path))
    
    var license = 'unknown'
    var licenseFile

    if (pkg_info.license) {
        license = pkg_info.license
        licenseFile = pkg_path
    } else if (pkg_info.licenses) {
        license = pkg_info.licenses.map(function(license) { 
            return license.type + " ("+license.url+")" 
        }).join(', ')
        licenseFile = pkg_path
    } else {    

        var files = fs.readdirSync(proj_path)
        files.some(function(name) {
            if (/license/i.test(name)) {
                var file = path.join(proj_path, name)
                if (fs.statSync(file).isFile()) {
                    license = getLicenseType(file)
                    licenseFile = file
                    return true
                }
            }
            return false
        })
        if (!licenseFile) {
            files.some(function(name) {
                if (/^readme/i.test(name)) {
                    var file = path.join(proj_path, name)
                    console.log("looking at "+file)
                    if (fs.statSync(file).isFile()) {
                        var result = getReadmeLicense(file)
                        if (result) {
                            license = result
                            licenseFile = file
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

    var deps = pkg_info.dependencies || {}
    Object.keys(deps).forEach(function(name) {
        var res = checkPath(path.join(proj_path, 'node_modules', name))
        if (res) {
            res.name = name
            res.deps = res.deps || []
            dependencies.push(res)
        }
    })

    return {
        name: pkg_info.name,
        version: pkg_info.version,
        license: license,
        licenseFile: licenseFile,
        deps: dependencies
    }
}