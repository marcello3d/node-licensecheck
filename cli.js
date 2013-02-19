// Based on code shamelessly lifted from https://github.com/shtylman/node-weaklink (with permission)

var colors = require('colors')
var treeify = require('treeify')

var licensecheck = require('./index.js')

function mapDeps(info) {
    var key = info.name + (" ("+ info.version+")").grey + ' ── '

    var file = info.licenseFile
    if (file) {
        file = file.replace(/\/node_modules\//g, ' ~ ')
        if (info.license == 'nomatch') {
            key += ('unmatched license file: ' + file).yellow
        } else {
            key += info.license.green + ' ── ' + file.grey
        }
    } else {
        key += "no license found".red
    }

    var tree = {}
    var dependencies = tree[key] = {}
    info.deps.map(mapDeps).forEach(function (dependency) {
        var key = Object.keys(dependency)[0]
        dependencies[key] = dependency[key]
    })
    return tree
}

treeify.asLines(mapDeps(licensecheck(process.argv[2] || '.')), false, console.log)
