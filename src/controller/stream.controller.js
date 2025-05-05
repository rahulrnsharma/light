const express = require('express');
const { v4: uuidv4 } = require('uuid');
const streamModel = require('../model/stream.model');
const path = require('path');
const fs = require('fs');
const logger = require('../utility/logger');

async function create(req, res){
  const { title } = req.body;
  const userId = req.user.userId;
  const streamKey = uuidv4();
  const stream = await streamModel.create({ title, userId, streamKey });
  logger.info("Stream created successfully",{streamKey})
  res.json({
    streamKey,
    hlsUrl: `http://localhost:8000/stream/${streamKey}`
  });
};

async function get(req, res) {
  const { title } = req.query;
  const query = title ? { title: new RegExp(title, 'i'), isLive: true } : { isLive: true };
  const streams = await streamModel.find(query);
  logger.info("Stream find successfully",streams)
  res.json(streams);
};


function file(req, res) {
  console.log("file accessed")
  const { streamKey, fileName } = req.params;
  const filePath = path.join(__dirname, '..','..','media', 'live', streamKey, fileName);

  if (fs.existsSync(filePath)) {
    logger.info("File find successfully",filePath)
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
};

function stream(req,res){
  const { streamKey } = req.params;
  const playlistPath = path.join(__dirname,'..','..', 'media', 'live', streamKey, 'index.m3u8');
  if (fs.existsSync(playlistPath)) {
    let playlist = fs.readFileSync(playlistPath, 'utf8');
    playlist = playlist.replace(/(index\d+\.ts)/g, (match) => `/stream/${streamKey}/${match}`);
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    logger.info("Stream find successfully",playlist)
    res.send(playlist);
  } else {
    res.status(404).send('Stream not found');
  }
};


module.exports = {create,get,file,stream}