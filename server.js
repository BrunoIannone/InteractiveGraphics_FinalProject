const express = require('express');
const path = require('path');

const app = express();

// Middleware per consentire le richieste CORS da tutte le origini durante lo sviluppo
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Consente le richieste da tutte le origini
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.static(path.join(__dirname)));

app.listen(3000, async () => {
  console.log('Server avviato su http://localhost:3000/');
  console.log(__dirname);
  
  // Dynamically import the open module and use it
  const open = (await import('open')).default;
  open('http://localhost:3000/');
});
