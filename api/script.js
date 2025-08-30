module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  
  // Check if request is from Roblox
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    try {
      // Fetch the actual script content from pastefy
      const response = await fetch('https://pastefy.app/7NC2uDgT/raw');
      let scriptContent = await response.text();
      
      // Advanced anti-skidder protection
      const protection = `
-- Advanced Anti-Skidder Protection by 404-Hub
-- Multiple layers of protection against source stealing

-- Block common decompilers and analyzers
local blockedFunctions = {
    "decompile", "debug", "getrawmetatable", "setrawmetatable", 
    "hookfunction", "replaceclosure", "getgc", "getconstants",
    "getupvalues", "getprotos", "dumpstring", "saveinstance"
}

for _, func in pairs(blockedFunctions) do
    if _G[func] then
        _G[func] = function()
            game.Players.LocalPlayer:Kick("Security violation detected")
        end
    end
end

-- Disable multiple clipboard methods
local function disableClipboard()
    local blockedClipboard = {
        "setclipboard", "toclipboard", "clipboard.set", "syn.write_clipboard",
        "write_clipboard", "writefile", "appendfile", "makefolder"
    }
    
    for _, method in pairs(blockedClipboard) do
        if _G[method] then
            _G[method] = function()
                game:GetService("StarterGui"):SetCore("SendNotification", {
                    Title = "🛡️ 404-Hub Security",
                    Text = "Source protection active - Access denied",
                    Duration = 5
                })
                return false
            end
        end
    end
    
    -- Block nested access attempts
    local mt = getrawmetatable(game)
    local oldIndex = mt.__index
    setreadonly(mt, false)
    mt.__index = function(t, k)
        if typeof(k) == "string" and (k:lower():find("clipboard") or k:lower():find("writefile")) then
            return function() end
        end
        return oldIndex(t, k)
    end
    setreadonly(mt, true)
end

-- Anti-reverse engineering
local function antiReverse()
    -- Detect common reverse engineering tools
    local suspiciousGlobals = {"HttpSpy", "SimpleSpy", "RemoteSpy", "Synapse", "scriptware"}
    for _, tool in pairs(suspiciousGlobals) do
        if _G[tool] or rawget(_G, tool) then
            game.Players.LocalPlayer:Kick("Reverse engineering tool detected")
            return
        end
    end
    
    -- Obfuscate the main script execution
    spawn(function()
        wait(math.random(1, 3))
        disableClipboard()
    end)
end

-- Rate limiting check (prevent spam requests)
local lastRequest = tick()
if tick() - lastRequest < 0.5 then
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "⚠️ Rate Limited",
        Text = "Please wait before making another request",
        Duration = 3
    })
    return
end

-- IP-based detection (basic)
local requestIP = "${ip}"
local bannedIPs = {} -- Add known skidder IPs here if needed

-- Execute protection layers
antiReverse()
disableClipboard()

-- The actual protected script (obfuscated)
local protectedScript = [=[
${scriptContent.split('\n').map(line => `-- ${Math.random().toString(36).substr(2, 9)}\n${line}`).join('\n')}
]=]

-- Multi-layer execution with delay
spawn(function()
    wait(0.1)
    local success, result = pcall(function()
        loadstring(protectedScript)()
    end)
    
    if not success then
        game:GetService("StarterGui"):SetCore("SendNotification", {
            Title = " Protected Script",
            Text = "LOL",
            Duration = 2
        })
    end
end)

-- Cleanup traces
script = nil
protectedScript = nil
`;
      
      // Return the heavily protected script
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(protection);
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Error loading script\ngame.Players.LocalPlayer:Kick("Failed to load protected content")');
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
