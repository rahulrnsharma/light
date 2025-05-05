const NodeMediaServer = require('node-media-server');
const path = require('path');
const fs = require('fs');
const nmsConfig = require('./../config/nms.config');
const streamModel = require('../model/stream.model');
const { sendToFFmpeg, stopFFmpeg } = require('./ffmpeg');
const logger = require('../utility/logger');

const nms = new NodeMediaServer(nmsConfig);

function runNodeMediaServer() {
  nms.on('postPublish', (id) => {
    console.log('[NodeEvent on postPublish]', `id=${id.id} StreamPath=${id.streamPath}`);

    const streamKey = id.streamName;
    const streamApp = id.streamApp;
    const streamPath = path.join(__dirname, '..','..', 'media', 'live', streamKey);

    if (!fs.existsSync(streamPath)) {
      fs.mkdirSync(streamPath, { recursive: true });
    }
    sendToFFmpeg(nmsConfig, streamApp, streamKey, streamPath);
    // set stream is live
    logger.info(`Stream Strated Successfully - ${streamKey}`);
    streamModel.findOneAndUpdate({streamKey:streamKey},{isLive:true});
  });

  nms.on('donePublish', (id) => {
    const streamKey = id.streamName;
    // set stream is stopped
    logger.info(`Stream Stopped Successfully - ${streamKey}`);
    streamModel.findOneAndUpdate({streamKey:streamKey},{isLive:false});
    stopFFmpeg(streamKey);
  });

  nms.on('postPlay', (id) => {
    console.log('[NodeEvent on postPlay]', `id=${id.id} StreamPath=${id.streamPath}`);
  });

  nms.on('donePlay', (id) => {
    console.log('[NodeEvent on donePlay]', `id=${id.id} StreamPath=${id.streamPath}`);
  });

  nms.run();
}

module.exports = { runNodeMediaServer };
