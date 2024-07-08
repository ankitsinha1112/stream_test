const express = require('express');
const expressWs = require('express-ws');
const app = express();
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
// APIS
// ADMIN
const stream = require('./api/admin/stream');
const privateKey = fs.readFileSync('/etc/letsencrypt/live/https://stream-test-zthj.onrender.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/https://stream-test-zthj.onrender.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/https://stream-test-zthj.onrender.com/chain.pem', 'utf8');


const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
expressWs(app);
// Middleware
app.use(cors());
app.use(bodyParser.json());

// ROUTES
app.use('/admin/stream', (req, res, next) => {
    console.log('Stream route hit');
    next();
  }, stream);

// Test APIs
app.get('/', (req, res) => res.send('IOT Lights !!!'))
app.get('/test', (req, res) => res.send('Test Working !!!'))

const port = process.env.PORT || 8080;

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log("App is running on port " + port);
});
