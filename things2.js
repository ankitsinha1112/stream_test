const awsIot = require('aws-iot-device-sdk');

const device = awsIot.device({
  host: "a3afseuvzkw6r4-ats.iot.ap-south-1.amazonaws.com",
  port:8883,
  clientId: "ESP32_IoTSmartLight_Policy",
  caPath: "AmazonRootCA1.pem",
  certPath: "59dd1f0bfe35ea7ba972b43f1d12d958bd84374dd76cd06c8dbb0f281fe1ac58-certificate.pem.crt",
  keyPath: "59dd1f0bfe35ea7ba972b43f1d12d958bd84374dd76cd06c8dbb0f281fe1ac58-private.pem.key",
});

console.log("hello");
 device
 .on('connect', function() {
   console.log('connected');
   device.subscribe('esp32/sub');
 });

device
 .on('message', function(topic, payload) {
   console.log('message', topic, payload.toString());
 });