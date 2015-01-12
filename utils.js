var prompt = require('prompt'),
  fs = require('fs'),
  path = require('path'),
  shell = require('shelljs');

function resolvePath(filePath) {
  return path.resolve(process.cwd(), filePath);
}

function doesPathConform(filePath) {
  return fs.existsSync(filePath);
}

function promptForRawVolume(callback) {
  prompt.start();

  prompt.get([
    {
      name: 'rawVolume',
      description: 'Path to raw volume',
      message: 'Invalid raw volume path',
      before: resolvePath,
      conform: doesPathConform
    }
  ], callback);
}

module.exports = {
  isSudo: function() {
    return process.getuid() === 0;
  },
  getImagePath: function(callback) {
    prompt.start();

    prompt.get([
      {
        name: 'image',
        description: 'Path to image',
        message: 'Invalid image path',
        before: resolvePath,
        conform: doesPathConform
      }
    ], callback);
  },
  getVolume: function(callback) {
    prompt.start();

    prompt.get([
      {
        name: 'volume',
        description: 'Volume',
        message: 'Invalid volume',
        before: resolvePath,
        conform: doesPathConform
      }
    ], callback);
  },
  getRawVolume: function(volume, callback) {
    var rawVolume = volume.match(/(\/dev\/disk\d)s\d/);
    if(rawVolume && rawVolume[1]) {
      rawVolume = rawVolume[1].substring(0, 5) + 'r' + rawVolume[1].substring(5);
      console.log('Raw volume calculated as "' + rawVolume + '"');

      prompt.start();
      prompt.get([{ name: 'continue', description: 'Use calculated raw volume: yes/no', default: 'yes', validator: /yes|no/, warning: 'Response must be yes or no' }], function(err, result) {
        if (err) { console.error(err); process.exit(1); }

        if(result.continue === 'no') {
          promptForRawVolume(callback);
        } else {
          callback(null, { rawVolume: rawVolume });
        }
      });
    } else {
      promptForRawVolume(callback);
    }
  },
  unmountVolume: function(volume, callback) {
    var success = shell.exec('sudo diskutil unmount ' + volume, { silent: true });

    if(success.code === 0) {
      callback();
    } else {
      callback(success.output);
    }
  },
  flashImageToVolume: function(imagePath, volume, callback) {
    var success = shell.exec('sudo dd bs=1m if=' + imagePath + ' of=' + volume, { silent: true });

    if(success.code === 0) {
      callback();
    } else {
      callback(success.output);
    }
  }
}
