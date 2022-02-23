APP.get('https://raw.githubusercontent.com/heftreng49/depo/master/manifest.json', function(req, res) {
    res.append('Content-Type', 'text/javascript');
    res.sendFile(path.join(depo, "manifest.json"));
});

APP.get('https://raw.githubusercontent.com/heftreng49/depo/master/sw.js', function(req, res) {
    res.append('Content-Type', 'text/javascript');
    res.sendFile(path.join(depo, "https://raw.githubusercontent.com/heftreng49/depo/master/sw.js"));
});
