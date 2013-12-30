var http = require('http');
var url  = require('url');
var path = require('path');
var fs   = require('fs');
var port = process.argv[2] || 1337;

http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname,
            filename = path.join(process.cwd(), 'app', uri);
  
  path.exists(filename, function(exists) {
    if(!exists) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;
    }
 
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
      }
 
      res.writeHead(200);
      res.write(file, "binary");
      res.end();
    });
  });
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
