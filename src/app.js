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

      let json = uif2json(req.file.buffer);
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

    let data = json2uif(req.body);
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