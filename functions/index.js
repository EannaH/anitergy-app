/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const express = require('express');
const next = require('next');
const path = require('path');

// Set development mode to false for production
const dev = false;
const app = next({ dev, conf: { output: 'standalone', assetPrefix: '/_next/' } });
const handle = app.getRequestHandler();

// Create and export a Cloud Function named "nextjsApp"
exports.nextjsApp = functions.https.onRequest((req, res) => {
  // Ensure Next.js app is prepared
  app.prepare().then(() => {
    const server = express();

    // Serve static files from .next/static. 
    // Adjust the path so it points to the correct directory.
    server.use('/_next/static', express.static(path.join(__dirname, '..', '.next', 'static')));

    // Handle all other requests with Next.js
    server.all('*', (req, res) => handle(req, res));

    return server(req, res);
  }).catch((err) => {
    console.error('Error preparing Next.js app:', err);
    res.status(500).send('Error preparing Next.js app');
  });
});


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
