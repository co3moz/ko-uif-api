const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const uif2json = require('./lib/uif2json');
const json2uif = require('./lib/json2uif');


const app = express();
app.set('x-powered-by', false);
app.set('etag', false);

app.use(express.static(path.resolve(__dirname, './public'), { etag: false }));
app.use('/resource', express.static(path.resolve(__dirname, '../resource'), {
  etag: true,
  maxAge: '1h'
}));

const uifUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 256 * 1024,
    files: 1,
    fields: 1,
    fieldSize: 256 * 1024
  }
}).single('uif');
const jsonUpload = (bodyParser.json({ limit: '1mb' }));

app.use(compression({}));



app.post('/uif2json', (req, res) => {
  uifUpload(req, res, err => {
    if (err) {
      res.status(400);

      return res.send({
        err: err.message
      });
    }

    try {
      if (!req.file || !req.file.buffer) {
        throw new Error('no file');
      }

      let begin = process.hrtime();
      let json = uif2json(req.file.buffer);
      let time = process.hrtime(begin).reduce((n, x, i) => i == 0 ? x * 1000 : n + x / 1e6, 0);
      console.log('uif2json request. took: %sms size: %d', time, req.file.buffer.length);
      res.send(json);
    } catch (err) {
      res.status(400);
      res.send({
        err: err.message
      })
    }
  })
});

app.post('/json2uif', jsonUpload, (req, res) => {
  try {
    if (!req.body) {
      throw new Error('no json');
    }

    let begin = process.hrtime();
    let data = json2uif(req.body);
    let time = process.hrtime(begin).reduce((n, x, i) => i == 0 ? x * 1000 : n + x / 1e6, 0);
    console.log('json2uif request. took: %sms size: %s', time, data.length);
    res.send(data);
  } catch (err) {
    res.status(400);
    res.send({
      err: err.message
    })
  }
});

app.listen(80, '0.0.0.0', () => {
  console.log('server started!');
});