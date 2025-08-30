module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Check if request is from Roblox
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    try {
      // Fetch the actual script content from pastefy
      const response = await fetch('https://pastefy.app/7NC2uDgT/raw');
      let scriptContent = await response.text();
      
      // Add anti-clipboard protection
      const protection = `
-- Anti-Source Protection
local protectedScript = [=[
${scriptContent}
]=]

-- Disable common source stealing methods
local oldSetClipboard = setclipboard or toclipboard or writefile or function() end
setclipboard = function() 
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Http 404",
        Text = "Please check url",
        Duration = 1
    })
end
toclipboard = setclipboard
writefile = function() end

-- Execute the protected script
loadstring(protectedScript)()

-- Restore functions after execution (optional)
-- setclipboard = oldSetClipboard
`;
      
      // Return the protected script
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(protection);
    } catch (error) {
      // If fetching fails, return error
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Error loading script');
    }
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
