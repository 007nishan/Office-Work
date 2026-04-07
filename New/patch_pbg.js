const fs = require('fs');

let pbg = fs.readFileSync('c:/Users/NISHAN/Desktop/Office Work/New/GeoStudio_PBG_Controller.js', 'utf8');

const targetStr = `    function openHeartbeatAndClickTranscript(cidValue) {
      copyToClipboard(cidValue);
      const url = 'https://heartbeat.cs.amazon.dev/#/';
      if (!heartbeatWindow || heartbeatWindow.closed) {
        heartbeatWindow = window.open(url, 'HeartbeatWindow');
        setTimeout(() => heartbeatChannel.postMessage({ trigger: true, cidValue }), 3000);
      } else {
        heartbeatWindow.focus();
        heartbeatChannel.postMessage({ trigger: true, cidValue });
      }
    }`;

const newStr = `    function openHeartbeatAndClickTranscript(cidValue) {
      // 1. Preserve critical existing functionality:
      copyToClipboard(cidValue);
      
      // 2. Secret URL Mailbox pattern for safe cross-origin transmission on fresh tabs
      const freshUrl = 'https://heartbeat.cs.amazon.dev/#/?pulseCid=' + encodeURIComponent(cidValue);
      
      if (!heartbeatWindow || heartbeatWindow.closed) {
        console.log('[PBG] Opening fresh Heartbeat tab with URL Payload');
        heartbeatWindow = window.open(freshUrl, 'HeartbeatWindow');
      } else {
        console.log('[PBG] Heartbeat already open, dispatching direct postMessage');
        heartbeatWindow.focus();
        heartbeatWindow.postMessage({ type: 'HEARTBEAT_TRIGGER', trigger: true, cidValue: cidValue }, '*');
      }
    }`;

// Replace exact match using string index to strictly bypass regex whitespace quirks
const idx = pbg.indexOf("function openHeartbeatAndClickTranscript");
if (idx > -1) {
    const endIdx = pbg.indexOf("    // Left Shift toggle");
    const block = pbg.substring(idx, endIdx);
    
    // We basically just replace 'block' with newStr + newline
    pbg = pbg.substring(0, idx) + newStr + '\n\n' + pbg.substring(endIdx);
    
    fs.writeFileSync('c:/Users/NISHAN/Desktop/Office Work/New/GeoStudio_PBG_Controller.js', pbg);
    console.log("Successfully replaced openHeartbeatAndClickTranscript block!");
} else {
    console.error("Could not find function openHeartbeatAndClickTranscript");
}
