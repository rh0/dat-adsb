# dat-adsb :satellite:

This is an SDR app that recieves ADS-B radio signals from aircraft :airplane: :helicopter: and writes that data to a Dat archive. All of the radio and demodulation work in this app is being handled by a couple of great utilities written by [Thomas Watson](https://github.com/watson). If you are interested quickly getting up and running mapping flights, and arn't too interested in all this p2p stuff, I highly suggest checking out his excellent app [AirplaneJS](https://github.com/watson/airplanejs).

## Requirements
### Hardware
You will need an RTL-SDR dongle with the RTL2832U chip (when searching RTL-SDR most of them will have this chip). [rtl-sdr.com](https://www.rtl-sdr.com/buy-rtl-sdr-dvb-t-dongles/) has some very nice options available (some custom built for ADS-B reception in mind), but any cheap RTL2832U RTL-SDR dongle should work.  
**Be sure you get an antenna!**  
Many dongles will come packaged with one, but not all. Ideally the antenna should be acceptable for 1090MHz reception, but even the cheapies that come with some dongles will work (but your range will suffer). You can of course build your own, and [rtl-sdr.com has a great overview](https://www.rtl-sdr.com/adsb-aircraft-radar-with-rtl-sdr/) (scroll to the ADSB-Antennas section) of antennas commonly used for this purpose.

### Software
You will need [librtlsdr](https://github.com/steve-m/librtlsdr) on your system.

##### Linux
Debian flavours:  
```
apt-get-install librtlsdr-dev
```
Arch flavours:  
_Installing the [rx_tools package](https://aur.archlinux.org/packages/rx_tools/) from aur is the easiest._  
```
pacaur -S rx_tools
```
##### Mac (Homebrew)
```
brew install librtlsdr
```
##### Windows
:question::confused::question:

## Use
This application is intended to be run in the background as a service.  However initially it is helpful to run this application manually. This allows you to be sure everything is working correctly, as well as allowing you to see the dat key the data is published to (although you can find this later too).
```
Found Rafael Micro R820T tuner
Provisioning Radio...
Max available gain is: 49.6
Setting gain to: 49.6
Gain reported by device: 49.6
Exact sample rate is: 2000000.052982 Hz
Serving dat://879a67f30e8ccd117c731c9eb4d7f45a8200bcc58bffa20c77855e3980ecaf72
```

### Station Info
The 'station' object in `package.json` allows you to provide a name and a brief description string for your ADS-B station.
```json
  "station": {
    "name": "My Cool ADS-B Station",
    "desc": "Running a Raspberry Pi using a simple dipole antenna."
  }
```
This information (along with some stats on the radio) will be published in the root of the dat archive in the `station.json` file.
