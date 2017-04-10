const { PluginError } = require('gulp-util');
const through = require('through2');

const MODULE_NAME = 'gulpAnnotate.noCache';

let ARGS_MATCHER, EXT_MATCHER;

function initRegExp(){
    ARGS_MATCHER = /\/\/@NoCache\(\)[\n](.*)/g;
    EXT_MATCHER = /\.([^.]*?)[A-Z-a-z-0-9]*/;
}

function _parseAnnotationInStringFile(stringContent){
    stringContent.replace(ARGS_MATCHER, (match, $1) =>
        $1.replace(EXT_MATCHER, (extension) => `${match}v=${timestamp}`)
    )
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
}

function noCache() {
    initRegExp();
    return through.obj(_doAnnotate);
}

module.exports = noCache;