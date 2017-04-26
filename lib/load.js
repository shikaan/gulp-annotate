const globArray = require('glob-array');
const { PluginError } = require('gulp-util');
const exists = require('fs').existsSync;
const through = require('through2');
const path = require('path');

let ARGS_MATCHER, GLOB_MATCHER, NO_ARGS_MATCHER;
const MODULE_NAME = "gulp-annotate.load";

function initRegExp(){
    ARGS_MATCHER = /\/\/@Load\(([^)]+)\)/g;
    GLOB_MATCHER = /\/\/@Load\(([^)]+)\)/;
    NO_ARGS_MATCHER = /\/\/@Load\(\)/g;
}

/**
 * Checks whether or not a match contains a label
 * @param {string} match
 * @return {boolean}
 */
function _hasLabel(match){
    let firstCommaPosition = match.indexOf(',');
    if(match.indexOf('[') !== -1)
        return firstCommaPosition > 0 && firstCommaPosition < match.indexOf('[');
    return firstCommaPosition > 0
}

/**
 * Checks whether or not a match contains a options object
 * @param {string} match
 * @return {boolean}
 */
function _hasOptions(match){
    let lastCommaPosition = match.lastIndexOf(',');
    let firstCommaPosition = match.indexOf(',');
    return lastCommaPosition !== firstCommaPosition && lastCommaPosition > match.indexOf(']');
}

/**
 * Tries to extract globs in the match between the two delimiters
 * @param {string} match 
 * @param {number} start 
 * @param {number} end 
 */
function _getGlobsFromMatch(match, start, end){
    let globs = JSON.parse(match.slice(start, end).trim());
    if(Array.isArray(globs)){
        return globs
    }
    else{
        throw new PluginError("Invalid glob array")
    }
}

/**
 * Extracts data from match
 * @param {string} match
 * @return {Object.{label: string, globs: string}}
 */
function _getDataFromMatch(match){
    let lastComma = match.lastIndexOf(',');
    let globs, options;

    let label;
    if(_hasLabel(match)){
        label = match.slice(0, match.indexOf(','));
    }
    else{
        let error = `\n\nUnable to find LABEL in:\n${match}\\n`
        throw new PluginError(MODULE_NAME, error)
    }

    if(_hasOptions(match)){
		let lastArgsComma = match.split('{')[0].lastIndexOf(',');
        try {
            globs = _getGlobsFromMatch(match, match.indexOf(',') + 1, lastArgsComma);
        }
        catch(e){
            let error = `\nUnable to parse GLOBS from:\n${match}\nGlobs must be an array (even if length is one!)\n`;
            throw new PluginError(MODULE_NAME, error);
        }
        
        try {
            options = JSON.parse(match.slice(lastArgsComma + 1, match.length).trim());
        }
        catch(e){
            let error = `\n\nUnable to parse OPTIONS from:\n${match}\nOptions must be a JSON object!\n`;
            throw new PluginError(MODULE_NAME, error);
        }
    }
    else{
        try{
            globs = _getGlobsFromMatch(match, match.indexOf(',') + 1, match.length);
        }
        catch(e){
            let error = `\n\nUnable to parse GLOBS from:\n${match}\nGlobs must be an array (even if length is one!)\n`;
            throw new PluginError(MODULE_NAME, error);
        }
        options = {};
    }

    return { label, globs, options }
}

/**
 * Takes a string (or file content in string form) and extracts globs.
 * Those globs are then stored in the returned map.
 * @param {string} stringFile 
 * @returns {Map<String, String[]>} 
 */
function _getGlobArraysFromStringFile(stringFile) {
    let globArrays = new Map(), 
        hasMatch = false,
        token = '';

    while (token = ARGS_MATCHER.exec(stringFile)) {
        hasMatch = true;
        let match = token[1].replace(/'/g, '"');
        let data = _getDataFromMatch(match);
        
        if(globArrays.has(data.label))
            throw new PluginError(MODULE_NAME, `\nDuplicate label!`);
        
        globArrays.set(data.label, [data.globs, data.options]);
    }

    if(!hasMatch){
        if(NO_ARGS_MATCHER.test(stringFile)) {
            throw new PluginError(MODULE_NAME, `\nEmpty arguments!`)
        }
    }

    return globArrays;
}

/**
 * Uses glob to extract arrays of files from the globArray map 
 * @param {Map<string, array>} globArrays - map of array of globs
 * @returns {Map<string, array>}
 */
function _getFileListsFromGlobArrays(globArrays) {
    let fileLists = new Map();

    for (let entry of globArrays) {
        let fileArray = globArray.sync(entry[1][0], {});
        let options = entry[1][1];

        if(options && options.base && exists(options.base)){
            fileArray.forEach((filePath, index) => {
				if(options.posix && options.posix === true){
					 fileArray[index] = path.posix.relative(options.base, filePath);
				}
				else{
					fileArray[index] = path.relative(options.base, filePath);
				}
			  })
        }

        fileLists.set(entry[0], fileArray)
    }

    return fileLists;
}

/**
 * Replaces the globs with file paths in the buffer case
 * @param {string} stringFile 
 * @param {Map<string, array>} fileLists 
 */
function _replaceGlobsWithFilesInStringFile(stringFile, fileLists) {
    return stringFile.replace(ARGS_MATCHER, (token) => {
        let match = GLOB_MATCHER.exec(token)[1].replace(/'/g, '"');
        let data = _getDataFromMatch(match);

        return `"${fileLists.get(data.label).join("\",\n\"")}"`
    })
}

/**
 * Aggregator. Handles evenrything regarding the Buffer case.
 * @param {string} stringFile 
 */
function _parseAnnotationInStringFile(stringFile) {
    let globMap = _getGlobArraysFromStringFile(stringFile);
    if(globMap.size > 0){
        let fileListsMap = _getFileListsFromGlobArrays(globMap);
        return _replaceGlobsWithFilesInStringFile(stringFile, fileListsMap);
    }
    return stringFile;
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

function load() {
    initRegExp();
    return through.obj(_doAnnotate);
}

module.exports = load;