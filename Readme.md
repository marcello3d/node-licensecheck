License-check [![Build Status](https://travis-ci.org/marcello3d/node-licensecheck.png)](https://travis-ci.org/marcello3d/node-licensecheck)
==================
A quick way to see the licenses of modules you depend on—recursively.

Installation
------------
`npm -g install licensecheck`.

Usage
------------
```
licensecheck [-m/--missing-only] [-h/--highlight regexp] [optional dir]

    -m / --missing-only : only list licenses that are unspecified
    -f / --flat : write flattened list of dependencies
    --tsv : write flattened list of dependencies, tab-separated, wihtout coloring (suitable for parsing)
    -h regexp / --highlight regexp : highlight licenses entries that match the regular expression (case insensitive)

```

DISCLAIMER
----------

I am not a lawyer. The output of this app should not be considered legal advice and is not guaranteed to be accurate.

Example
-------

```
$ licensecheck
└─ licensecheck (0.2.0) ── zlib ── package.json
   ├─ colors (0.6.0-1) ── MIT ── node_modules/colors/MIT-LICENSE.txt
   ├─ markdown (0.4.0) ── MIT (http://www.opensource.org/licenses/mit-license.php) ── node_modules/markdown/package.json
   │  └─ nopt (1.0.10) ── MIT (https://github.com/isaacs/nopt/raw/master/LICENSE) ── node_modules/markdown ~ nopt/package.json
   │     └─ abbrev (1.0.4) ── MIT (https://github.com/isaacs/abbrev-js/raw/master/LICENSE) ── node_modules/markdown ~ nopt ~ abbrev/package.json
   └─ treeify (0.4.2) ── MIT (http://lp.mit-license.org/) ── node_modules/treeify/package.json

$ licensecheck -f
abbrev (1.0.4) ── MIT (https://github.com/isaacs/abbrev-js/raw/master/LICENSE) ── node_modules/markdown ~ nopt ~ abbrev/package.json
colors (0.6.0-1) ── MIT ── node_modules/colors/MIT-LICENSE.txt
licensecheck (0.2.0) ── zlib ── package.json
markdown (0.4.0) ── MIT (http://www.opensource.org/licenses/mit-license.php) ── node_modules/markdown/package.json
nopt (1.0.10) ── MIT (https://github.com/isaacs/nopt/raw/master/LICENSE) ── node_modules/markdown ~ nopt/package.json
treeify (0.4.2) ── MIT (http://lp.mit-license.org/) ── node_modules/treeify/package.json
```


How it works
------------

Licensecheck looks for license information in the following order:

1. `package.json` "license" field
2. `package.json` "licenses" field
3. file with `license` in its name
4. file with `readme` in its name
    a. if the filename ends in `.md` or `.markdown`, parses markdown looking for a section with `license` in its name
    b. otherwise checks for `license` in its text

If matching a file (as opposed to `package.json`), it looks for substrings that match the `license-files` folder (ignoring 
case, whitespace, punctuation, etc.).

Notes
-----

This is pretty hacky and experimental, so use at your own risk. 

License
-------
License-check is open source software under the [zlib license][1].
[1]: LICENSE
