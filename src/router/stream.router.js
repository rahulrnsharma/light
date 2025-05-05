const express = require('express');
const router = express.Router();
const streamController = require('../controller/stream.controller');
const authMiddelware = require('../middelware/auth.middelware');

router.post('/create',authMiddelware, streamController.create);

router.get('/get', streamController.get);

router.get('/:streamKey/:fileName', streamController.file);

router.get('/:streamKey', streamController.stream);

module.exports = router;
