# gulp-annotate #

[![Build Status](https://travis-ci.org/shikaan/gulp-annotate.svg?branch=master)](https://travis-ci.org/shikaan/gulp-annotate)
[![Coverage Status](https://coveralls.io/repos/github/shikaan/gulp-annotate/badge.svg?branch=master)](https://coveralls.io/github/shikaan/gulp-annotate?branch=master)

[![NPM](https://nodei.co/npm/gulp-annotate.png)](https://nodei.co/npm/gulp-annotate/)

Makes Gulp write the boring parts of your code!


## Installation ##

Run 

```
    npm install --save gulp-annotate
```

## Features ##

- **`gulpAnnotate.load`**: replaces `@Load` annotation with a list of file paths.
- **`gulpAnnotate.noCache`**: prevents file to be cached by browser

_Upcoming_
- **`gulpAnnotate.objectIgnore`**: makes a property not enumerable


## Usage ##

- [@Load](doc/load.md);
- [@NoCache](doc/no-cache.md);

## Contributing

You can contribute to this project. 

1. Fork this repo;

2. Install dependencies

    npm install

3. Write your wonderful code 

4. Before pull-requesting please run:

```cmd
npm test
npm run lint
```

Only linted and tested requests will be accepted.