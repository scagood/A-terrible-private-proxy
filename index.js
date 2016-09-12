var socks = require('socksv5'),
    fs = require('fs'),
    md5 = require('md5'),
    fs = require('fs'),
    colour = require('colors'),
    
    port = 5050,
    authURI = 'auth.proxy',
    rediURI = 'google.com',
    users = {};
    
var srv = socks.createServer(function(info, accept, deny) {
    var src = info.srcAddr + ":" + info.srcPort;
    var dst = info.dstAddr + ":" + info.dstPort;
    var ips = [];
    
    for(var a in users) 
        ips.push(users[a].address);
    
    if (info.dstAddr == authURI) {
        var socket = accept(true),
            body = fs.readFileSync("./auth.html", "utf8");
        console.log('Auth address: '.cyan + info.srcAddr.white);
        socket.end([
            'HTTP/1.1 200 OK',
            'Server: Proxy Auth',
            'Content-Length: ' + Buffer.byteLength(body),
            'Content-Type: text/html; charset=UTF-8',
            'Connection: Closed',
            '',
            body
        ].join('\r\n'));
    } else if (info.dstAddr.match(new RegExp("([a-z0-9]+)\\.([a-z0-9]+)\\."+authURI.split(".").join("\\."), "ig"))) {
        var regex = new RegExp("([a-z0-9]+)\\.([a-z0-9]+)\\."+authURI.split(".").join("\\."), "ig").exec(info.dstAddr);
        var socket = accept(true),
            user = regex[1],
            pass = regex[2];
        
        if (typeof users[user] != "undefined" && md5(users[user]["password"]) == pass) {
            console.log(user.cyan + ' is logged in via ' + info.srcAddr.magenta);
            users[user].address = info.srcAddr;
            socket.end([
                'HTTP/1.1 302 OK',
                'Connection: close',
                'Location: http://' + rediURI + '/',
                ''
            ].join('\r\n'));
        } else {
            console.log(user.cyan + ' failed to log in via ' + info.srcAddr.magenta);
            socket.end([
                'HTTP/1.1 302 OK',
                'Connection: close',
                'Location: http://' + authURI + '/',
                ''
            ].join('\r\n'));
        }
    } else if (ips.indexOf(info.srcAddr) != -1) {
        console.log('Source: '.cyan + src.yellow + ', '+'Destination: '.cyan + dst.yellow);
        accept();
    } else {
        var socket = accept(true);
        console.log('Source: '.cyan + src.red);
        socket.end([
            'HTTP/1.1 302 OK',
            'Connection: close',
            'Location: http://' + authURI + '/',
            ''
        ].join('\r\n'));
    }
});

fs = require('fs')
fs.readFile('./users.json', 'utf8', function (err,data) {
    var pass, a;
    if (err) 
        return console.log(err);
    
    data = JSON.parse(data);
    for (a in data) {
        users[a] = {};
        users[a]["password"] = data[a];
    }
    console.log(users)
});

srv.listen(port, '0.0.0.0', function() {
    console.log('SOCKSv5 started '.green.bold + 'on port '.cyan + port.toString().yellow);
});

srv.useAuth(socks.auth.None());