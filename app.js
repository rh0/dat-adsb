#!/usr/bin/env node

const Dat = require('dat-node')
const rtlsdr = require('./lib/rtlsdr')
const storeEmitter = require('./lib/store').storeEmitter
const store = require('./lib/store').store

const dataFolder = 'flight_data'

rtlsdr.start()

Dat(dataFolder, {indexing: false, latest:true, sparse: true}, function(err, dat) {
  if(err) throw err

  dat.joinNetwork()
  console.log('Serving dat://'+dat.key.toString('hex'))

  console.log('Cleaning up Legacy Files')
  dat.archive.readdir('/', function(err, files) {
    if(err) throw err

    files.forEach(function(legacyFile) {
      dat.archive.unlink(legacyFile, function(err) {
        if(err) throw err
      })
    })
    console.log('%d files removed', files.length)
  })

  setInterval(function() {
    store.getAircrafts().filter(function(aircraft) {
      return aircraft.lat
    })
    .forEach(function(aircraft) {
      dat.archive.readFile(aircraft.icao + '.json', 'utf8', (err, data) => {
        if (err) {
          if (err.notFound === true) {
            dat.archive.writeFile(aircraft.icao + '.json', JSON.stringify(aircraft), function(err) {
              if(err) throw err
            })
          }
          else throw err
        }
        else {
          var prevRecord = JSON.parse(data)
          if(prevRecord.lat != aircraft.lat && prevRecord.lng != aircraft.lng) {
            dat.archive.writeFile(aircraft.icao + '.json', JSON.stringify(aircraft), function(err) {
              if(err) throw err
            })
          }
        }
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
