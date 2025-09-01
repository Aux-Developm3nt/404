module.exports = async (req, res) => {
  const authKey = req.query.auth || '';
  const userAgent = req.headers['user-agent'] || '';
  
  // Check for correct auth key
  if (authKey === 'zRkaP4c15osmNs27us') {
    try {
      // Get your script from environment variable
      const scriptUrl = process.env.SCRIPT_URL;
      
      if (!scriptUrl) {
        return res.status(500).send('-- Error: Script URL not configured');
      }
      
      const response = await fetch(scriptUrl);
      const scriptContent = await response.text();
      
      // Simple protection wrapper
      const finalScript = `-- 404 Hub Pro
game:GetService("StarterGui"):SetCore("SendNotification", {
    Title = "✅ Script Loaded",
    Text = "404 Hub Pro activated",
    Duration = 3
})

-- Block clipboard
_G.setclipboard = function() return false end
_G.toclipboard = function() return false end

-- Your script:
${scriptContent}`;

      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(finalScript);
      
    } catch (error) {
      return res.status(500).send('-- Error: ' + error.message);
    }
  }
  
  // No auth or wrong auth - return fake error
  res.setHeader('Content-Type', 'text/plain');
  return res.status(404).send('-- Error: Script not found');
};
