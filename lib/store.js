const AircraftStore = require('mode-s-aircraft-store')
const EventEmitter = require('events')

exports.storeEmitter = new EventEmitter();

//Overwriting the AircraftStore _prune method to emit an event.
AircraftStore.prototype._prune = function () {
  const self = this
  const threshold = Date.now() - this._timeout
  Object.keys(this._index).forEach(function (icao) {
    const aircraft = self._index[icao]
    if (aircraft.seen < threshold) {
      delete self._index[icao]
      exports.storeEmitter.emit('aircraftTimeout', icao)
    }
  })
}

exports.store = new AircraftStore({
  timeout: 120000 // 2 mins
})

