// Based on code shamelessly lifted from https://github.com/shtylman/node-weaklink (with permission)

var colors = require('colors')

var licensecheck = require('./index.js')

function print_deps(info, level, last) {
    level = level || 0;

    var arr = new Array(level + 1)
    var out = arr.join('│ ') + (last ? '└' : '├')+'─'+(info.deps && info.deps.length ? '┬' : '─') +' ' + info.name + ' ── '
    
    if (info.licenseFile) {
        if (info.license == 'nomatch') {
            console.log(out + ('unmatched license file: ' + info.licenseFile).yellow)
        } else {
            console.log(out + info.license.green + ' ── ' + info.licenseFile.grey)
        }
    } else {
        console.log(out + "no license file".red)
    }

    info.deps.forEach(function(dep, index, array) {
        print_deps(dep, level + 1, index == array.length - 1)
    })
}

print_deps(licensecheck(process.argv[2] || '.'))