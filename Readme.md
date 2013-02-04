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
    ├─┬ licensecheck ── zlib ── package.json
    │ └── colors ── MIT ── node_modules/colors/MIT-LICENSE.txt

Notes
-----

This is pretty hacky and experimental, so use at your own risk.

License
-------
License-check is open source software under the [zlib license][1].
[1]: LICENSE
