var express = require('express');
var fs = require('fs');
var readline = require('readline')
var http = require('http')
var server = express();


var monitored = {}
var page = {}
	page.urls = ''
	page.stat = ''
	page.notour = '<html><body><p><h1>This server isn\'t monitored</h1></p></body></html>'

console.log('Will be monitoring:');

page.stat = fs.readFileSync('static.html').toString();
fs.readFileSync('servers.txt').toString().split("\n").forEach(function (item) {// Magic one-liner XD
	console.log(item)
	if(item[0] != '#' & item != ''){ // allow commenting out servers in list
		page.urls += `<p><a href="/${item}">${item}</a></p>`
		monitored[item] = {}
		monitored[item].status = []
	}
}); 

page.urls = `<html><body><p><h1>Monitored servers list:</h1></p>${page.urls}</body></html>`

server.get('/', function (req, res) {
	res.send(page.urls);
});

server.get('/:server', function (req, res) {
	if(monitored[req.params.server]) {
		res.send(page.stat);
	} else {
		res.status(404).send(page.notour);
	}
});

server.get('/:server/stat', function (req, res) {
	if(monitored[req.params.server]) {
		let t = req.query.t || 0
		let arr = []
		//console.log(monitored[req.params.server].status);
		for(let i of monitored[req.params.server].status){
			if(i.time > t){
				arr.push(i);
			}
		}
		//console.log(arr);
		res.send(JSON.stringify(arr));
	} else {
		res.status(404).send(page.notour);
	}
});

server.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});

function monitor() {
	let time = Date.now()
	for(let i in monitored){
		if(monitored[i].req){
			monitored[i].req.abort()	
		}
		let url = i.split(':') //split url into base and port
		monitored[i].req = http.get(`http://${url[0]}/`,{port: url[1]}, res => {
			res.setEncoding("utf8");
			let body = "";
			res.on("data", data => {
				body += data;
			});
			res.on("end", () => {
				let data = JSON.parse(body);
				data.time = time
				pushdata(i, data);
				//console.log('ok')
			});
		}).on('error', (err) => {
			let data = {}
			data.time = time
			pushdata(i, data);
			//console.log(`error ${err}`)
		})
	}
}

function pushdata(item, data){
	while(monitored[item].status.length >= 360){
		monitored[item].status.shift();
	}
	monitored[item].status.push(data);
	console.log(data);
}

monitor();
setInterval(monitor, 10000);
