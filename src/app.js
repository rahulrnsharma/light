const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const authRouter = require("./router/auth.router")
const streamRouter = require('./router/stream.router');
const authValidate = require('./middelware/auth.middelware');
const logger = require('./utility/logger');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.set('views', path.join(__dirname,'..','docs'))
app.set('view engine', 'hbs')
mongoose.connect('mongodb://localhost:27017/light');

app.get('/', function(req, res){ 
  res.render('docs') 
}) 

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use('/stream',streamRouter);
app.use('/live',express.static(path.join(__dirname, 'media')));
app.use('/auth', authRouter );

module.exports = app;
