const fs = require('fs');

try {
  console.log("Patching PBG Controller...");
  let pbg = fs.readFileSync('c:/Users/NISHAN/Desktop/Office Work/New/GeoStudio_PBG_Controller.js', 'utf8');

  // Strip the old listener block + the function block
  const pbgRegex = /\/\/ Cross-domain handshake variables replacing broadcast channel[\s\S]+?pendingHeartbeatCid = null;\r?\n      \}\r?\n    \}/;
  
  const newPbgFunc = `function openHeartbeatAndClickTranscript(cidValue) {
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

  pbg = pbg.replace(pbgRegex, newPbgFunc);
  
  // Bump internal version just purely for console log clarity
  pbg = pbg.replace(/@version      13.4/, '@version      13.5');
  pbg = pbg.replace(/GeoStudio PBG Controller V13.4/g, 'GeoStudio PBG Controller V13.5');
  
  fs.writeFileSync('c:/Users/NISHAN/Desktop/Office Work/New/GeoStudio_PBG_Controller.js', pbg);
  console.log("PBG patched successfully with URL Hybrid.");

  console.log("Patching Heartbeat...");
  let hb = fs.readFileSync('c:/Users/NISHAN/Desktop/Office Work/New/PS_HEARTBEAT.js', 'utf8');

  const hbRegex = /\/\/ Send a READY handshake to the opener \[\s\S\][\s\S]+?triggerAction\(\); \r?\n    \}\r?\n  \}\);/;

  const newHbInit = `// --- CROSS-DOMAIN HYBRID INITIALIZATION --- //

  // 1. Scrape URL Mailbox parameter first if present (From fresh GeoStudio launch)
  var pulseMatch = window.location.hash.match(/[?&]pulseCid=([^&]+)/);
  if (pulseMatch && pulseMatch[1]) {
      var extractedCid = decodeURIComponent(pulseMatch[1]);
      console.log('PS_HEARTBEAT: Fresh spawn caught URL mail: ', extractedCid);
      window._latestCidPayload = extractedCid;
      
      // Clean up the URL quietly to prevent refresh loops or confusing the user
      var cleanHash = window.location.hash.replace(/[?&]pulseCid=[^&]+/, '');
      if (cleanHash === '#' || cleanHash === '') cleanHash = '#/';
      window.history.replaceState(null, '', window.location.pathname + cleanHash);
      
      // Delay slightly just to allow React DOM to physically render before setup routines take over
      setTimeout(triggerAction, 800); 
  }

  // 2. Listen for postMessage for all subsequent rapid clicks when tab is already fully open
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'HEARTBEAT_TRIGGER' && e.data.trigger) {
      console.log("PS_HEARTBEAT: Received live CROSS-DOMAIN pulse! Payload:", e.data);
      window._latestCidPayload = e.data.cidValue;
      triggerAction(); 
    }
  });

  // ------------------------------------------ //`;

  hb = hb.replace(hbRegex, newHbInit);
  
  // Fix minor typo if present from prev iteration
  hb = hb.replace(/\[\s\S\]/g, ""); 
  
  hb = hb.replace(/@version      3.3/, '@version      3.4');
  hb = hb.replace(/PS_HEARTBEAT v3.3/gi, 'PS_HEARTBEAT v3.4');

  fs.writeFileSync('c:/Users/NISHAN/Desktop/Office Work/New/PS_HEARTBEAT.js', hb);
  console.log("Heartbeat patched successfully with URL Hybrid.");
} catch(e) {
  console.error(e);
}
