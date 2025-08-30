module.exports = (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Check if request is from Roblox
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    // For Roblox executors - return the script
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send('loadstring(game:HttpGet("https://pastefy.app/7NC2uDgT/raw"))()');
  }
  
  // For browsers - show 404 page
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
    <title>404 - Script not found</title>
    <style>
        body { 
            background: #1a1a1a; 
            color: white; 
            font-family: monospace; 
            padding: 20px; 
        }
    </style>
</head>
<body>404 - Script not found</body>
</html>
  `);
};
