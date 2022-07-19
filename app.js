const http = require('http');
const util = require('util');
const fs = require('fs')

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method.toUpperCase();

  if (url === '/') {
    res.write(` 
    <body>
      <h1>Enter message</h1>
      <form action="/message" method="POST">
        <input type="text" name="message" label="message"/>
        <button type="submit">Submit</button>
      </form>
    </body>
    `);
    return res.end();
  }

  if (url === '/message' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => { body.push(chunk); });
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1];
      fs.writeFile('message.txt', message, (err) => {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  }

  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Hello from Node.js</h1>`);
  res.end();
});

server.listen(3000);
