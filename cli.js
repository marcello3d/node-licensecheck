// Based on code shamelessly lifted from https://github.com/shtylman/node-weaklink (with permission)

var colors = require('colors')
var treeify = require('treeify')

var licensecheck = require('./index.js')

var path = '.'
var missingOnly = false
var flat = false
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

function getDescription(info) {
    var key = info.name + (" (" + info.version + ")").grey + ' ── '

    var file = info.licenseFile
    if (file) {
        file = file.replace(/\/node_modules\//g, ' ~ ')
        if (info.license == 'nomatch') {
            key += ('unmatched license file: ' + file).yellow
        } else if (highlight && highlight.test(info.license)) {
            key += info.license.magenta + ' ── ' + file.grey
        } else {
            key += info.license.green + ' ── ' + file.grey
        }
    } else {
        key += "no license found".red
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