const http = require('http');
const util = require('util');

const server = http.createServer((req, res) => {
  console.log(`URL: ${req.url} \n METHOD: ${req.method}, \n HEADERS: ${util.inspect(req.headers)}`);
  res.setHeader('Content-Type', 'text/html');
  res.write('<h1>Hello World buddy</h1>');
  // Response must not change after ending it.
  res.end();
});

server.listen(3000);
