const { PluginError, log } = require('gulp-util');
const through = require('through2');
const path = require('path');

const MODULE_NAME = 'gulpAnnotate.noCache';
const timestamp = Date.now();

let ARGS_MATCHER, EXT_CHARS_MATCHER;

function initRegExp(){
    ARGS_MATCHER = /\/\/@NoCache\(\)[\n](.*)/g;
    EXT_CHARS_MATCHER = /[A-Za-z0-9-_.]*/;
}

function _isAPath(string){
    return string.indexOf('/') !== -1 || string.indexOf(path.separator) !== -1
}

function _hasExtension(string){
    if(_isAPath(string)){
        return string.indexOf('.') !== -1 && 
            string.indexOf('.') !== string.length && 
            string.lastIndexOf('.') > string.lastIndexOf('/');
    }
    return string.indexOf('.') !== -1 && string.indexOf('.') !== string.length;
}

function _getVersionedStringUsingSeparator(string, separator){
    let brokenString = string.split(separator); 
    let extension = brokenString.slice(-1)[0];
    let noCacheExtension = extension.replace(EXT_CHARS_MATCHER, (match) => `${match}?v=${timestamp}`);

    brokenString[brokenString.length - 1] = noCacheExtension;
    brokenString[0] = brokenString[0].trim(); 
    return brokenString.join(separator)
}

function _parseAnnotationInStringFile(stringContent){
    return stringContent.replace(ARGS_MATCHER, (match, $1) => {
        if(_hasExtension($1)){
            return _getVersionedStringUsingSeparator($1, '.');
        }
        if(_isAPath($1)){
            return _getVersionedStringUsingSeparator($1, '/');
        }
        else
            throw new PluginError(
                MODULE_NAME,
                `Unable to version the string:\n ${$1} \nIt should be a path. Try to prefix url with './'`
            )
    })
}

/**
 * The through callback. 
 * @param {*} file 
 * @param {*} encoding 
 * @param {*} done 
 */
function _doAnnotate(file, encoding, done) {
    if (file.isNull()) {
        return done(null, file);
    }
    
    if (file.isStream()) {
        let error = new PluginError(MODULE_NAME, 'Stream is not supperted (yet)!')
        this.emit('error', error);
        return done(error);
    }

    if (file.isBuffer()) {
        let stringContent = file.contents.toString();
        try {
            file.contents = new Buffer(_parseAnnotationInStringFile(stringContent));
        }
        catch(error){
            this.emit('error', error);
            return done(error);
        }
        return done(null, file);
    }
    
    return done(null, file);
}

function noCache() {
    initRegExp();
    return through.obj(_doAnnotate);
}

module.exports = noCache;