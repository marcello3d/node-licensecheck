// Based on code shamelessly lifted from https://github.com/shtylman/node-weaklink (with permission)

var colors = require('colors')
var treeify = require('treeify')

var licensecheck = require('./index.js')

var path = '.'
var missingOnly = false
var flat = false
var format = 'color'
var highlight = null

for (var i=2; i<process.argv.length; i++) {
    var arg = process.argv[i]
    switch (arg) {
        case '-m':
        case '--missing-only':
            missingOnly = true
            break
        case '-h':
        case '--highlight':
            highlight = new RegExp(process.argv[++i], 'i')
            break
        case '-f':
        case '--flat':
            flat = true
            break
        case '--tsv':
            format = 'tsv'
            flat = true
            break
        default:
            path = arg
            break
    }
}

if (flat) {
    var dependencies = makeFlatDependencyMap(licensecheck(path))
    Object.keys(dependencies).sort().forEach(function(key) {
        console.log(dependencies[key])
    })
} else {
    treeify.asLines(makeDependencyTree(licensecheck(path)), false, console.log)
}


function isMissing(info) {
    return !info.licenseFile || info.license == 'nomatch'
}

function simplifyFile(file) {
    return file.replace(/\/node_modules\//g, ' ~ ')
}

function getDescription(info) {
    var key
    if (format == 'color') {
        var sep = ' ── '
        key = info.name + (" (" + info.version + ")").grey + sep

        var file = info.licenseFile
        if (file) {
            file = simplifyFile(file)
            if (info.license == 'nomatch') {
                key += ('unmatched license file: ' + file).yellow
            } else if (highlight && highlight.test(info.license)) {
                key += info.license.magenta + sep + file.grey
            } else {
                key += info.license.green + sep + file.grey
            }
        } else {
            key += "no license found".red
        }
    } else if (format == 'tsv') {
        var sep = '\t'
        key = info.name + " (" + info.version + ")" + sep

        var file = info.licenseFile
        if (file) {
            if (info.license == 'nomatch') {
                key += 'unmatched: ' + file + sep
            } else {
                key += info.license + sep + file
            }
        } else {
            key += "MISSING" + sep
        }
    } else {
        throw Error("invalid format: " + format)
    }
    return key;
}


function makeDependencyTree(info) {
    if (missingOnly && !isMissing(info) && !info.deps.some(isMissing)) {
        return {}
    }
    var key = getDescription(info);
    var tree = {}
    var dependencies = tree[key] = {}
    info.deps.map(makeDependencyTree).forEach(function (dependency) {
        Object.keys(dependency).forEach(function (key) {
            dependencies[key] = dependency[key]
        })
    })
    return tree
}

function makeFlatDependencyMap(info) {
    var map = {}
    if (!missingOnly || isMissing(info)) {
        map[info.name+'@'+info.version] = getDescription(info)
    }
    info.deps.forEach(function(dep) {
        var subMap = makeFlatDependencyMap(dep)
        Object.keys(subMap).forEach(function(key) {
            if (!map[key]) {
                map[key] = subMap[key]
            }
        })
    })
    return map
}
