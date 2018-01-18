const rtlsdr = require('rtl-sdr')
const debug = require('debug')('dat-adsb')
const Demodulator = require('mode-s-demodulator')
const store = require('./store').store

let dev

function onEnd() {}

// Populate our aircraft store.
function onData (data, size) {
  demodulator.process(data, size, function(message) {
    store.addMessage(message)
  })
}

exports.start = function() {
  if(dev) throw new Error('Cannot start rtlsdr more than once')

  dev = provisionRadio()

  // Start reading data
  rtlsdr.read_async(dev, onData, onEnd, bufNum, bufLen)
}

function provisionRadio() {
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
    debug('No supported RTL-SDR devices found.')
    process.exit(1)
  }

  debug('Found %d device(s).', deviceCount)
  rtlsdr.get_device_usb_strings(deviceIndex, vendor, product, serial)
  debug('%s, %s, SN: %s', vendor, product, serial)

  const dev = rtlsdr.open(deviceIndex)
  if(typeof dev === 'number') {
    debug('Error opening the RTLSDR device: %s', dev)
    process.exit(1)
  }

  debug('Provisioning Radio...')
  // Set Max Gain
  let gain = 0
  rtlsdr.set_tuner_gain_mode(dev, 1)
  if(!autoGain) {
    if(findMaxGain) {
      // Find the maximum gain available
      const gains = new Int32Array(100)
      const numgains = rtlsdr.get_tuner_gains(dev, gains)
      //debug('numgains: %d', numgains)
      gain = gains[numgains - 1]
      debug('Max available gain is: %d', gain / 10)
    }
    debug('Setting gain to: %d', gain / 10)
    rtlsdr.set_tuner_gain(dev, gain)
  } else {
    debug('Using automatic gain control')
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

  debug('Gain reported by device: %d', rtlsdr.get_tuner_gain(dev) / 10)

  // Lets read some data
  const bufNum = 12
  const bufLen = 2 ** 18 // 256K

  return dev
}
