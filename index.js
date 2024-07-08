const express = require('express');
const expressWs = require('express-ws');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
// APIS
// const users = require('./api/client/user');
// ADMIN
const users = require('./api/admin/users');
const area = require('./api/admin/area');
const device = require('./api/admin/device');
const ticket = require('./api/admin/ticket');
const stream = require('./api/admin/stream');
expressWs(app);
// Middleware
app.use(cors());
app.use(bodyParser.json());

// ROUTES
// app.use('/user', users);
// ADMIN
app.use('/admin/users', users);
app.use('/admin/areas', area);
app.use('/admin/device', device);
app.use('/admin/ticket', ticket);
app.use('/admin/stream', (req, res, next) => {
    console.log('Stream route hit');
    next();
  }, stream);

// Test APIs
app.get('/', (req, res) => res.send('IOT Lights !!!'))
app.get('/test', (req, res) => res.send('Test Working !!!'))

const port = process.env.PORT || 8080;

app.listen((port), () => console.log("App is running on port " + port));