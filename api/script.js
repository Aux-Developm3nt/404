module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    try {
      // URL is hidden in environment variables - not visible in source
      const scriptUrl = process.env.SCRIPT_URL;
      const response = await fetch(scriptUrl);
      let scriptContent = await response.text();
      
      const protection = `
local blockedFunctions = {"setclipboard", "toclipboard", "writefile", "decompile", "debug"}
for _, func in pairs(blockedFunctions) do if _G[func] then _G[func] = function() 
game:GetService("StarterGui"):SetCore("SendNotification", {Title = "Access Denied", Text = "Protected", Duration = 3}) end end end
spawn(function() wait(0.1) loadstring([=[${scriptContent}]=])() end)
`;
      
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(protection);
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Error');
    }
  }
  
  // Browser - obfuscated 404 page
  const fakeHtml = `<!DOCTYPE html><html><head><title>404</title><style>body{background:#1a1a1a;color:white;padding:20px;font-family:monospace;}</style></head><body>404 - Script not found</body></html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(fakeHtml);
};
