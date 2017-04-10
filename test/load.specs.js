/* eslint-env node, mocha */
/* eslint-disable dot-location */
const { expect } = require('chai');
const File = require('vinyl');
const path = require('path');
const gulp = require('gulp');
const gulpAnnotate = require('../');

function fixtures(fileName) {
    return path.join(__dirname, 'load-fixtures', fileName);
}

describe('Module: Load', () => {

    it('should pass file when it isNull()', (done) => {
        let stream = gulpAnnotate.load();
        let emptyFile = {
            isNull: () => true
        };
        stream.once('data', (data) => {
            expect(data).to.equal(emptyFile);
            done();
        });
        stream.write(emptyFile);
        stream.end();
    });

    it('should pass file when it not null, strem nor buffer', (done) => {
        let stream = gulpAnnotate.load();
        let emptyFile = {
            isNull: () => false,
            isStream: () => false,
            isBuffer: () => false
        };
        stream.once('data', (data) => {
            expect(data).to.equal(emptyFile);
            done();
        });
        stream.write(emptyFile);
        stream.end();
    });

    describe('in stream mode', () => {
        it('should throw error', (done) => {
            let stream = gulpAnnotate.load();
            let streamFile = {
                isNull: () => false,
                isStream: () => true
            };
            stream.once('error', (err) => {
                expect(err.message).to.equal('Stream is not supperted (yet)!');
                done();

            });
            stream.write(streamFile);
            stream.end();
        })
    })

    describe('in buffer mode', () => {
        it('should throw in case of invalid glob array with options', (done) => {
            gulp.src(fixtures('wrong-glob-array.js'))
                .pipe(gulpAnnotate.load())
                .once('error', (err) => {
                    expect(err.message).to.contain('Unable to parse GLOBS')
                    expect(err.message).to.not.contain('Unable to parse OPTIONS')
                    done()
                })
        });

        it('should throw in case of invalid glob array without options', (done) => {
            gulp.src(fixtures('wrong-glob-array-no-opt.js'))
                .pipe(gulpAnnotate.load())
                .once('error', (err) => {
                    expect(err.message).to.contain('Unable to parse GLOBS')
                    expect(err.message).to.not.contain('Unable to parse OPTIONS')
                    done();
                })
        })

        it('should throw in case arguments are blank', (done) => {
            gulp.src(fixtures('wrong-no-args.js'))
                .pipe(gulpAnnotate.load())
                .once('error', (err) => {
                    expect(err.message).to.contain('Empty arguments!')
                    done();
                })
        })

        it('should throw in case of malformed options', (done) => {
            gulp.src(fixtures('wrong-opts.js'))
                .pipe(gulpAnnotate.load())
                .once('error', (err) => {
                    expect(err.message).to.not.contain('Unable to parse GLOBS')
                    expect(err.message).to.contain('Unable to parse OPTIONS')
                    done();
                })
        })

        it('should throw in case of duplicate labels', (done) => {
            gulp.src(fixtures('wrong-duplicate-label.js'))
                .pipe(gulpAnnotate.load())
                .once('error', (err) => {
                    expect(err.message).to.contain('Duplicate label!')
                    done();
                })
        })

        it('should throw in case of missing label', (done) => {
            gulp.src(fixtures('wrong-no-label.js'))
                .pipe(gulpAnnotate.load())
                .once('error', (err) => {
                    expect(err.message).to.not.contain('Unable to parse GLOBS')
                    expect(err.message).to.not.contain('Unable to parse OPTIONS')
                    expect(err.message).to.contain('Unable to find LABEL')
                    done();
                })
        })

        it('should replace annotation with files with right base', (done) => {
            let fakeFile = new File({
                contents: new Buffer('//@Load(label, [\'lib/load.js\'], {\'base\': \'lib\'})')
            });

            let loader = gulpAnnotate.load();
            loader.write(fakeFile);

            loader.once('data', (file) => {
                expect(file.isBuffer()).to.equal(true);

                expect(file.contents.toString('utf-8')).to.equal("\"load.js\"")
                done();
            })
        })

        it('should ignore unknown options', (done) => {
            let fakeFile = new File({
                contents: new Buffer('//@Load(label, [\'lib/load.js\'], {\'notAvalid\': \'key\'})')
            });

            let loader = gulpAnnotate.load();
            loader.write(fakeFile);

            loader.once('data', (file) => {
                expect(file.isBuffer()).to.equal(true);

                expect(file.contents.toString('utf-8')).to.equal("\"lib/load.js\"")
                done();
            })
        })

        it('should do nothing when there are no annotations', (done) => {
            let fakeFile = new File({
                contents: new Buffer('console.log("Hey! I am a plain JavaScript file!");')
            });

            let loader = gulpAnnotate.load();
            loader.write(fakeFile);

            loader.once('data', (file) => {
                expect(file.isBuffer()).to.equal(true);

                expect(file.contents.toString('utf-8')).to.equal(fakeFile.contents.toString('utf-8'));
                done();
            })
        })

        it('should replace annotation with files without options', (done) => {
            let fakeFile = new File({
                contents: new Buffer('//@Load(label, [\'lib/load.js\'])')
            });

            let loader = gulpAnnotate.load();
            loader.write(fakeFile);
            loader.end();

            loader.once('data', (file) => {
                expect(file.isBuffer()).to.equal(true);
                expect(file.contents.toString('utf-8')).to.equal("\"lib/load.js\"")
            })
            loader.once('end', () => {
                done();
            })
        })

        it('should replace as there is no base in case of unfound base', (done) => {
            let fakeFile = new File({
                contents: new Buffer('//@Load(label, [\'lib/load.js\'], {\'base\': \'not-existent\'})')
            });

            let loader = gulpAnnotate.load();
            loader.write(fakeFile);
            loader.end();

            loader.once('data', (file) => {
                expect(file.isBuffer()).to.equal(true);
                expect(file.contents.toString('utf-8')).to.equal("\"lib/load.js\"")
            })
            loader.once('end', () => {
                done();
            })
        })

        it('should replace with empty string in case of empty globs', (done) => {
            let fakeFile = new File({
                contents: new Buffer('var x = [\n//@Load(label, [\'not/existent*.js\'], {\'base\': \'.\'})\n];')
            });

            let loader = gulpAnnotate.load();
            loader.write(fakeFile);
            loader.end();

            loader.once('data', (file) => {
                expect(file.isBuffer()).to.equal(true);
                expect(file.contents.toString('utf-8')).to.equal("var x = [\n\"\"\n];")
            })
            loader.once('end', () => {
                done();
            })
        })
    })
});