module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    try {
      
      const response = await fetch('https://pastefy.app/7NC2uDgT/raw');
      let scriptContent = await response.text();
      
      const protection = `
-- Advanced Anti-Skidder Protection by 404-Hub
local blockedFunctions = {"decompile", "debug", "getrawmetatable", "setrawmetatable", "hookfunction", "replaceclosure", "getgc", "getconstants", "getupvalues", "getprotos", "dumpstring", "saveinstance"}
for _, func in pairs(blockedFunctions) do if _G[func] then _G[func] = function() game.Players.LocalPlayer:Kick("Security violation detected") end end end
local function disableClipboard() local blockedClipboard = {"setclipboard", "toclipboard", "clipboard.set", "syn.write_clipboard", "write_clipboard", "writefile", "appendfile", "makefolder"} for _, method in pairs(blockedClipboard) do if _G[method] then _G[method] = function() game:GetService("StarterGui"):SetCore("SendNotification", {Title = "🛡️ 404-Hub Security", Text = "Source protection active - Access denied", Duration = 5}) return false end end end end
disableClipboard()
spawn(function() wait(0.1) loadstring([=[${Buffer.from(scriptContent).toString('base64')}]=]) end)
`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(protection);
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Error loading script');
    }
  }
  
  res.setHeader('Content-Type', 'text/html');
  const obfuscatedHTML = `<!DOCTYPE html><html><head><title>404 - Script not found</title><style>body{background:#1a1a1a;color:white;font-family:monospace;padding:20px;}${Array.from({length: 50}, () => `.${Math.random().toString(36).substr(2, 9)}{display:none;}`).join('')}</style></head><body>404 - Script not found${Array.from({length: 100}, () => `<!--${Math.random().toString(36).substr(2, 20)}-->`).join('')}<script>${Array.from({length: 20}, () => `var ${Math.random().toString(36).substr(2, 9)} = "${Math.random().toString(36).substr(2, 50)}";`).join('')}console.log("${Array.from({length: 10}, () => Math.random().toString(36).substr(2, 20)).join('')}");</script></body></html>`;
  
  return res.status(200).send(obfuscatedHTML);
};
  
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
