const rtlsdr = require('rtl-sdr')
const Demodulator = require('mode-s-demodulator')
const store = require('./store').store

const demodulator = new Demodulator()

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

  // Lets read some data
  const bufNum = 12
  const bufLen = 2 ** 18 // 256K

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

  const deviceCount = rtlsdr.get_device_count()

  // No radios found, die.
  if(!deviceCount) {
    console.log('No supported RTL-SDR devices found.')
    process.exit(1)
  }

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

  console.log('Gain reported by device: %d', rtlsdr.get_tuner_gain(dev) / 10)

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

  return dev
}
