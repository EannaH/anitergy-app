const express = require('express');
const next = require('next');
const path = require('path');

const port = process.env.PORT || 3000;
const app = next({ dev: false, conf: { output: 'standalone', assetPrefix: '/_next/' } });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Serve static assets from the .next/static folder.
  // Adjust the path so it points to your .next/static folder relative to this file.
  server.use('/_next/static', express.static(path.join(__dirname, '.next', 'static')));

  // All other requests are handled by Next.js.
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
