module.exports = async (req, res) => {
  const authKey = req.query.auth || '';
  const userAgent = req.headers['user-agent'] || '';
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  

  const validAuth = process.env.SCRIPT_AUTH || 'zRkaP4c15osmNs27us';
  
  
  console.log(`[LOAD] ${clientIP} - ${userAgent} - Auth: ${authKey}`);
  
  
  if (authKey !== validAuth) {
    console.log(`❌ Invalid auth attempt: ${authKey}`);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(403).send('-- Access denied: Invalid authentication');
  }
  
  
  const isRobloxRequest = userAgent.includes('Roblox') || 
                         userAgent.includes('RobloxStudio') ||
                         (!userAgent.includes('Mozilla') && 
                          !userAgent.includes('Chrome') && 
                          !userAgent.includes('Safari'));
  
  if (!isRobloxRequest) {
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Access Denied</title></head>
      <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px;">
        <h1>🚫 Access Denied</h1>
        <p>This endpoint is for authorized Roblox executors only.</p>
      </body>
      </html>
    `);
  }
  
  try {
    
    const scriptUrl = process.env.SCRIPT_URL;
    
    if (!scriptUrl) {
      console.log('❌ SCRIPT_URL environment variable not set');
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Configuration error: Script URL not configured');
    }
    
    const response = await fetch(scriptUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    let scriptContent = await response.text();
    
    const protectedScript = `-- 404 Hub - Protected Script
-- Authenticated access only
-- Key: ${authKey.substring(0, 8)}...

local Players = game:GetService("Players")
local StarterGui = game:GetService("StarterGui")
local HttpService = game:GetService("HttpService")

local player = Players.LocalPlayer

local function setupProtection()
    
    local clipboardFuncs = {"setclipboard", "toclipboard", "writeclipboard", "clipboard", "setclip"}
    for _, funcName in pairs(clipboardFuncs) do
        if _G[funcName] then
            _G[funcName] = function(...)
                StarterGui:SetCore("SendNotification", {
                    Title = "🔒 Protection Active",
                    Text = "Clipboard access blocked",
                    Duration = 2
                })
                return false
            end
        end
    end
    
    local originalHttpGet = HttpService.HttpGet
    HttpService.HttpGet = function(self, url, ...)
        if url and (url:find("404%-hub%.vercel%.app") or url:find("auxhub")) then
            warn("🚫 Blocked HttpGet attempt to: " .. url)
            error("HTTP 403: Source protection active")
        end
        return originalHttpGet(self, url, ...)
    end
    
    local mt = getrawmetatable(game)
    if mt then
        local oldNamecall = mt.__namecall
        setreadonly(mt, false)
        mt.__namecall = function(self, ...)
            local method = getnamecallmethod()
            local args = {...}
            
            if method == "HttpGet" and args[1] then
                local url = tostring(args[1])
                if url:find("404%-hub%.vercel%.app") or url:find("auxhub") then
                    error("Access denied - Source theft blocked")
                end
            end
            
            return oldNamecall(self, ...)
        end
        setreadonly(mt, true)
    end
end

setupProtection()

StarterGui:SetCore("SendNotification", {
    Title = "✅ 404 Hub",
    Text = "Script loaded successfully",
    Duration = 3
})

${scriptContent}

spawn(function()
    while wait(3) do
        
        if _G.setclipboard and typeof(_G.setclipboard) == "function" then
            local testResult = pcall(_G.setclipboard, "test")
            if testResult then
                _G.setclipboard = function() return false end
                warn("🚫 Restored clipboard function blocked")
            end
        end
    end
end)`;

    console.log(`✅ Script served to authenticated user: ${clientIP}`);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(protectedScript);
    
  } catch (error) {
    console.error('❌ Script fetch error:', error);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('-- Error: Unable to load script');
  }
};
