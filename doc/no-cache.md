# @NoCache #

The annotation `@NoCache` is used this way

    //@NoCache()
    **row containing the path of the file you don't want to be cached**

## Example of application ##

Suppose you're wokring with AngularJS directives. Every time you push a brand new upgrade
of your template, your users have to clean the cache to see the wonderful things you 
just made. It's such a shame!  

Obviously `@NoChache` is here for you to solve this kind of problems! 

```javascript
(function (angular) {
    function myDirective() {
        return {
            restrict: "E",
            scope: {},
            //@NoCache()
            templateUrl: 'my-diretive/my-directive.template.html'
        }
    }

    angular.module('module').directive('myDirective', myDirective);
}(angular))
```
This way, when you make a gulp build, the HTML file is versioned with a timestamp and the 
browser is forced download the last version available.

## Example of usage ##

In your gulp file:

```javascript
const gulp = require('gulp');
const utils = require('gulp-util');
const gulpAnnotate = require('gulp-annotate');

gulp.task('annotate', function(){
    return gulp.src(['my-directive/my-directive.directive.js'])
        .pipe(gulpAnnotate.noCache())
        .on('error', utils.log)
        .pipe(gulp.dest('build')
})
```

And you're done!

## Notes ##

As usual, this plugin is not meant to be used only in AngularJS nor even in only Javascript. 

Conversely, you can actually use this annotation in every text file you want.
Please do not forget the leading `//`.  