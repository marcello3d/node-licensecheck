License-check [![Build Status](https://travis-ci.org/marcello3d/node-licensecheck.png)](https://travis-ci.org/marcello3d/node-licensecheck)
==================
A quick way to see the licenses of modules you depend on—recursively.

Installation
------------
`npm -g install licensecheck`.

Usage
------------
`licensecheck [optional dir]`

Example
-------

    $ licensecheck 
    └─ licensecheck (0.1.0) ── zlib ── package.json
       ├─ colors (0.6.0-1) ── MIT ── node_modules/colors/MIT-LICENSE.txt
       └─ treeify (0.4.2) ── MIT (http://lp.mit-license.org/) ── node_modules/treeify/package.json


How it works
------------

Licensecheck looks for license information in the following order:

1. `package.json` "license" field
2. `package.json` "licenses" field
3. file with `license` in its name
4. file with `readme` in its name and `license` in its text

If matching a file (as opposed to `package.json`), it looks for substrings that match the `license-files` folder (ignoring 
case, whitespace, punctuation, etc.).

Notes
-----

This is pretty hacky and experimental, so use at your own risk. 

License
-------
License-check is open source software under the [zlib license][1].
[1]: LICENSE
