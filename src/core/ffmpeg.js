const { spawn } = require("child_process");
const path = require("path");

const ffmpegProcesses = new Map(); 

function sendToFFmpeg(nmsConfig, streamApp, streamKey, streamPath) {
  if (ffmpegProcesses.has(streamKey)) {
    console.log(`FFmpeg already running for streamKey: ${streamKey}`);
    return;
  }

  const inputUrl = `rtmp://127.0.0.1:${nmsConfig.rtmp.port}/${streamApp}/${streamKey}`;
  console.log("Starting FFmpeg for", inputUrl);

  const ffmpegProcess = spawn('ffmpeg', [
    '-re',                           // Read input at native frame rate (simulate real-time)
    '-i', inputUrl,                  // Input file or stream URL
  
    '-c:v', 'libx264',                // Encode video using H.264 codec
    '-preset', 'ultrafast',           // Use the fastest encoding preset (less compression, less CPU usage)
    '-tune', 'zerolatency',           // Optimize for lowest possible latency (good for live streaming)
  
    '-c:a', 'aac',                    // Encode audio using AAC codec
    '-ar', '44100',                   // Set audio sample rate to 44100 Hz
    '-b:a', '96k',                    // Set audio bitrate to 96kbps (smaller, faster)
  
    '-f', 'hls',                      // Output format: HLS (HTTP Live Streaming)
  
    '-hls_time', '1',                 // Create HLS segments of 1 second each (smaller = lower latency)
    '-hls_list_size', '3',             // Playlist will contain only last 3 segments (smaller = faster update)
    '-hls_flags', 'delete_segments+program_date_time+split_by_time',
    // delete_segments: remove old segments
    // program_date_time: add EXT-X-PROGRAM-DATE-TIME tags for better synchronization
    // split_by_time: split strictly by segment duration, even if frame isn't perfect
  
    '-hls_segment_type', 'mpegts',     // HLS segment format: MPEG-TS (Transport Stream)
  
    path.join(streamPath, 'index.m3u8') // Output file path: HLS playlist (index.m3u8)
  ]);
  
  

  ffmpegProcesses.set(streamKey, ffmpegProcess);

  ffmpegProcess.on('exit', (code, signal) => {
    console.error(`FFmpeg [${streamKey}] exited with code ${code}, signal ${signal}`);
    ffmpegProcesses.delete(streamKey);

    if (code !== 0) {
      console.log(`Retrying FFmpeg for streamKey: ${streamKey} after 3s`);
      setTimeout(() => {
        sendToFFmpeg(nmsConfig, streamApp, streamKey, streamPath);
      }, 3000);
    }
  });
}

function stopFFmpeg(streamKey) {
  const process = ffmpegProcesses.get(streamKey);
  if (process) {
    console.log(`Stopping FFmpeg for streamKey: ${streamKey}`);
    process.kill('SIGINT');
    ffmpegProcesses.delete(streamKey);
  } else {
    console.log(`No FFmpeg process found for streamKey: ${streamKey}`);
  }
}

module.exports = { sendToFFmpeg, stopFFmpeg };
