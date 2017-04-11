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
        it('should add timestamp versioning', (done) => {
            gulp.src(fixtures('ok.js'))
                .pipe(gulpAnnotate.noCache())
                .on('data', (data) => {
                    let stringData = data.contents.toString('utf-8');

                    expect(stringData).to.not.contain('//@NoCache');
                    expect(stringData).to.contain('my-diretive/my-directive.template.html?v=');

                    done();
                })
        })
    })
});