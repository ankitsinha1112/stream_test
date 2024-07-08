const express = require('express');
const stream = express.Router();
const { proxy, scriptUrl } = require('rtsp-relay')(stream);
const ffmpeg = require('ffmpeg-static');

const handler = proxy({
  url: `rtsp://167.71.236.148:8554/stream`,
  ffmpegOptions: { 
    ffmpeg: ffmpeg.path // Use ffmpeg-static binary
  },
  verbose: true,
});

stream.ws('/api/stream', (ws, req) => {
  console.log('WebSocket connection handler called');
  handler(ws, req);
});

stream.get('/', (req, res) => {
  res.send(`
  <canvas id='canvas'></canvas>
  <script src='${scriptUrl}'></script>
  <script>
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    loadPlayer({
      url: 'ws://' + location.host + '/admin/stream/api/stream',
      canvas: document.getElementById('canvas')
    });
  </script>
  `);
});

module.exports = stream;
