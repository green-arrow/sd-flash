#! /usr/bin/env node

var utils = require('./utils'),
  imagePath, volume, rawVolume;

if(!utils.isSudo()) {
  console.error('Please run "sd-flash" as root.');
  process.exit(1);
}

utils.getImagePath(function(err, result) {
  if(err) { console.error(err); process.exit(1); }

  imagePath = result.image;

  utils.getVolume(function(err, result) {
    if(err) { console.error(err); process.exit(1); }

    volume = result.volume;

    utils.getRawVolume(volume, function(err, result) {
      if(err) { console.error(err); process.exit(1); }

      rawVolume = result.rawVolume;

      console.log('Unmounting volume: ' + volume);
      utils.unmountVolume(volume, function(err) {
        if(err && err.indexOf('was already unmounted') < 0) { console.error(err); process.exit(1); }
        else if(err) { console.log(err); }

        console.log('Flashing image at "' + imagePath + '" to volume "' + volume + '"');
        console.log('Please be patient, this will take a few minutes.');
        utils.flashImageToVolume(imagePath, rawVolume, function(err) {
          if(err) {
            console.error(err);

            if(err.indexOf('Permission denied')) {
              console.error('Make sure you have access to write to this volume.');
              console.error('If this is an SD Card, make sure it is unlocked.');
            }

            process.exit(1);
          }

          console.log('Image "' + imagePath + '" flashed successfully to "' + rawVolume + '"!');
        });
      });
    })
  });
});
