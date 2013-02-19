License-check
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

Notes
-----

This is pretty hacky and experimental, so use at your own risk.

License
-------
License-check is open source software under the [zlib license][1].
[1]: LICENSE
