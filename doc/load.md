# @Load #

The annotation `@Load` is used this way

    //@Load(label, globArray[, options])

 but the last parameter isn't mandatory.

- *label*: 

    It's the unique identifier of that globs ensemble. It's **required** and it should not equal other labels in your project.

- *globArray*:

    It's an array of string globs representing the file paths you want to be written in your code. It's **required** and it should be _always_ an array, even with only one entry. It should look similar to this: `["login/*.js"]`.

- *options*:

    It's a JSON object. Supported options are:

    - *base*: it's the base path from which the glob expressions should be computed. 
    For Node.js geeks, it's just a `path.relative`. For the Gulp geeks, it's just like the `base` option in `gulp.src`.
	
	- *posix*: if it's set to true, it will force the use of posix path separator (a.k.a. `/`), else it will use the system one.

## Example of application ##

Suppose you have a huge array of files to load somewhere in your code. 
It really sucks to edit those entries manually on every file change.
But luckly `@Load` is here for you!


For example, you have the following directory structure (tree representation courtesy of 
[directree](https://github.com/shikaan/directree)):

    src
    └── login
        ├── form.directive.js
        ├── login.service.js
        ├── other.stuff1.js
        ├── other.stuff2.js
        ├── other.stuff3.js
        ├── other.stuff4.js
        ├── status.constants.js
        └── submit.directive.js



This is what a lazy loading method called in an AngularJS controller would look like without `@Load`: 

```javascript
(function(angular){
    "use strict";

    angular
        .module('app', [
            'oc.lazyLoad'
        ])
        .controller('LoginController', function($ocLazyLoad){
            $ocLazyLoad.load([
                'login/form.directive.js',
                'login/login.service.js',
                'login/other.stuff1.js',
                'login/other.stuff2.js',
                'login/other.stuff3.js',
                'login/other.stuff4.js',
                'login/status.constants.js',
                'login/submit.directive.js'
            ])
        })
})(angular);
```

This is what the same method looks like with `@Load`:

```javascript
(function(angular){
    "use strict";

    angular
        .module('app', [
            'oc.lazyLoad'
        ])
        .controller('LoginController', function($ocLazyLoad){
            $ocLazyLoad.load([
                //@Load(login, ["src/login/*.js"], {"base": "src"})
            ])
        })
})(angular);
```

Waaay better.

Plus, when you will rename, move, delete one of your files in the `login` folder, you don't have to 
worry about making you code aware of this change.

## Example of usage ##

In your gulp file:

```javascript
const gulp = require('gulp');
const utils = require('gulp-util');
const gulpAnnotate = require('gulp-annotate');

gulp.task('annotate', function(){
    return gulp.src(['src/login.controller.js'])
        .pipe(gulpAnnotate.load())
        .on('error', utils.log)
        .pipe(gulp.dest('build')
})
```

And you're done!

## Notes ##

This plugin is not meant to be used only in AngularJS nor even in only Javascript. 
Conversely, you can actually use this annotation in every text file you want.
Please do not forget the leading `//`.  