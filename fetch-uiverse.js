const https = require('https');
https.get('https://uiverse.io/SelfMadeSystem/giant-bird-69', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Find everything that looks like HTML and CSS
    const fs = require('fs');
    fs.writeFileSync('uiverse_dump.html', data);
    console.log('Saved to uiverse_dump.html');
  });
});
