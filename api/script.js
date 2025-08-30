module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    try {
      
      const response = await fetch('https://pastefy.app/7NC2uDgT/raw');
      let scriptContent = await response.text();
      
      
      const protection = `
-- Anti-Source Protection
local protectedScript = [=[
${scriptContent}
]=]

-- Disable common source stealing methods
local oldSetClipboard = setclipboard or toclipboard or writefile or function() end
setclipboard = function() 
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Access Denied",
        Text = "Source copying is disabled",
        Duration = 3
    })
end
toclipboard = setclipboard
writefile = function() end

-- Execute the protected script
loadstring(protectedScript)()

-- Restore functions after execution (optional)
-- setclipboard = oldSetClipboard
`;
      
      
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(protection);
    } catch (error) {
      
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Error loading script');
    }
  }
  
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
