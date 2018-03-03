# dat-adsb :satellite:

This is an SDR app that recieves ADS-B radio signals from aircraft :airplane: :helicopter: and publishes that data to a Dat archive. All of the radio and demodulation work in this app is being handled by a couple of great utilities written by @watson. If you are interested quickly getting up and running mapping flights, and arn't too interested in all this p2p stuff, I highly suggest checking out his excellent app [AirplaneJS](https://github.com/watson/airplanejs).

## Requirements
### Hardware
You will need an RTL-SDR dongle with the RTL2832U chip (when searching RTL-SDR most of them will have this chip). [rtl-sdr.com](https://www.rtl-sdr.com/buy-rtl-sdr-dvb-t-dongles/) has some very nice options available (some custom build for ADS-B reception in mind), but any cheap RTL2832U RTL-SDR dongle should work.  **Be sure you get an antenna!** Many dongles will come packaged with one, but not all. Ideally the antenna should be acceptable for 1090MHz reception, but even the cheapies that come with some dongles will work (but your range will suffer). You can of course build your own, and [rtl-sdr.com has a great overview](https://www.rtl-sdr.com/adsb-aircraft-radar-with-rtl-sdr/) (scroll to the ADSB-Antennas section) of antennas commonly used for ADS-B.

### Software

## Use
