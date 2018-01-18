const Dat = require('dat-node')
const debug = require('debug')('dat-adsb')
const rtlsdr = require('./lib/rtlsdr')
const storeEmitter = require('./lib/store').storeEmitter

const dataFolder = 'flight_data'

Dat(dataFolder, {indexing: false}, function(err, dat) {
  if(err) throw err

  dat.joinNetwork()
  debug('Serving dat://'+dat.key.toString('hex'))

  debug('Cleaning up Legacy Files')
  dat.archive.readdir('/', function(err, files) {
    if(err) throw err

    files.forEach(function(legacyFile) {
      dat.archive.unlink(legacyFile, function(err) {
        if(err) throw err
      })
    })
    debug('%d files removed', files.length)
  })

  setInterval(function() {
    store.getAircrafts().filter(function(aircraft) {
      return aircraft.lat
    })
    .forEach(function(aircraft) {
      dat.archive.writeFile(aircraft.icao + '.json', JSON.stringify(aircraft), function(err) {
        if(err) throw err
      })
    })
  }, 3000)

  storeEmitter.on('aircraftTimeout', function(icao) {
    dat.archive.unlink(icao + '.json', function(err) {
      // Expect some icao's to not be found as we arn't logging them all.
      if(err && err.status != 404) throw err
    })
  })
})
