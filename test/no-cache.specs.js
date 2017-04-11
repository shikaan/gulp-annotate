/* eslint-env node, mocha */
/* eslint-disable dot-location */
const { expect } = require('chai');
const File = require('vinyl');
const path = require('path');
const gulp = require('gulp');
const gulpAnnotate = require('../');

function fixtures(fileName) {
    return path.join(__dirname, 'no-cache-fixtures', fileName);
}

describe('Module: NoCache', () => {

    it('should pass file when it isNull()', (done) => {
        let stream = gulpAnnotate.noCache();
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

    describe('in stream mode', () => {
        it('should throw error', (done) => {
            let stream = gulpAnnotate.noCache();
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
        it('should add timestamp versioning when path contains extension', (done) => {
            gulp.src(fixtures('ok.js'))
                .pipe(gulpAnnotate.noCache())
                .on('data', (data) => {
                    let stringData = data.contents.toString('utf-8');

                    expect(stringData).to.not.contain('//@NoCache');
                    expect(stringData).to.contain('my-diretive/my-directive.template.html?v=');

                    done();
                })
        })

        it('should add timestamp versioning when path does not contain extension', (done) => {
            gulp.src(fixtures('ok-no-extension.js'))
                .pipe(gulpAnnotate.noCache())
                .on('data', (data) => {
                    let stringData = data.contents.toString('utf-8');

                    expect(stringData).to.not.contain('//@NoCache');
                    expect(stringData).to.contain('my-diretive/my-directive?v=');

                    done();
                })
        })

        xit('should do correct replacement when there are symbols in filename')
        xit('should do correct replacement when there are symbols in filename with no extension')
        xit('should do correct replacement when path has length 1 with')
        xit('should do correct replacement when path has length 1 with no extension')

        it('should do nothing in case there is no annotations', (done) => {
            let originalfile;
            gulp.src(fixtures('ok-no-annotations.js'))
                .on('data', (data) => {
                    originalfile = data.contents.toString('utf-8');
                })
                .pipe(gulpAnnotate.noCache())
                .on('data', (data) => {
                    let stringData = data.contents.toString('utf-8');

                    expect(stringData).to.equal(originalfile);

                    done();
                })
        })
    })
});