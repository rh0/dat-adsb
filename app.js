const rtlsdr = require('rtl-sdr')
const Demodulator = require('mode-s-demodulator')
const AircraftStore = require('mode-s-aircraft-store')
const fs = require('fs')
var Dat = require('dat-node')

var dataFolder = 'flight_data'

const store = new AircraftStore({
  timeout: 120000 // 2 mins
})

// Preping for radio setup.
const deviceIndex = 0,
      autoGain = false,
      findMaxGain = true,
      ppmCorrection = 0,
      agcMode = true,
      freq = 1090e6,
      sampleRate = 2e6

const vendor = Buffer.alloc(256),
      product = Buffer.alloc(256),
      serial = Buffer.alloc(256)

const deviceCount = rtlsdr.get_device_count()
const demodulator = new Demodulator()

// No radios found, die.
if(!deviceCount) {
  console.log('No supported RTL-SDR devices found.')
  process.exit(1)
}

console.log('Found %d device(s).', deviceCount)
rtlsdr.get_device_usb_strings(deviceIndex, vendor, product, serial)
console.log('%s, %s, SN: %s', vendor, product, serial)

const dev = rtlsdr.open(deviceIndex)
if(typeof dev === 'number') {
  console.log('Error opening the RTLSDR device: %s', dev)
  process.exit(1)
}

console.log('Provisioning Radio...')
// Set Max Gain
let gain = 0
rtlsdr.set_tuner_gain_mode(dev, 1)
if(!autoGain) {
  if(findMaxGain) {
    // Find the maximum gain available
    const gains = new Int32Array(100)
    const numgains = rtlsdr.get_tuner_gains(dev, gains)
    //console.log('numgains: %d', numgains)
    gain = gains[numgains - 1]
    console.log('Max available gain is: %d', gain / 10)
  }
  console.log('Setting gain to: %d', gain / 10)
  rtlsdr.set_tuner_gain(dev, gain)
} else {
  console.log('Using automatic gain control')
}

// Set the frequency correction value for the device
rtlsdr.set_freq_correction(dev, ppmCorrection)

// Enable or disable the internal digital AGC of the RTL2822
rtlsdr.set_agc_mode(dev, agcMode ? 1 : 0)

// Tune center frequency
rtlsdr.set_center_freq(dev, freq)

// Select sample rate
rtlsdr.set_sample_rate(dev, sampleRate)

// Reset the internal buffer
rtlsdr.reset_buffer(dev)

console.log('Gain reported by device: %d', rtlsdr.get_tuner_gain(dev) / 10)

// Lets read some data
const bufNum = 12
const bufLen = 2 ** 18 // 256K
rtlsdr.read_async(dev, onData, onEnd, bufNum, bufLen)

// Populate our aircraft store.
function onData (data, size) {
  demodulator.process(data, size, function(message) {
    store.addMessage(message)
  })
}

Dat(dataFolder, {indexing: false}, function(err, dat) {
  if(err) throw err

  dat.joinNetwork()
  dat.importFiles({watch: true})
  console.log('Serving dat://'+dat.key.toString('hex'))

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
})

function onEnd() {
  console.log('onEnd')
}
