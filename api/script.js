module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    const protectionCode = `
-- Immediate Clipboard Protection
local blockedFunctions = {"setclipboard", "toclipboard", "writefile", "appendfile", "saveinstance", "dumpstring"}

-- Block immediately
for _, func in pairs(blockedFunctions) do
    if _G[func] then
        _G[func] = function()
            game:GetService("StarterGui"):SetCore("SendNotification", {
                Title = "🚫 404-Hub Security",
                Text = "Clipboard access blocked",
                Duration = 3
            })
        end
    end
end

-- Also block direct access
setclipboard = function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "🚫 404-Hub Security", 
        Text = "Access denied",
        Duration = 3
    })
end

toclipboard = setclipboard
writefile = setclipboard

-- Now connect to server for actual script
local HttpService = game:GetService("HttpService")
local sessionId = "${Math.random().toString(36).substr(2, 15)}"

spawn(function()
    wait(0.5)
    local success, result = pcall(function()
        local url = "https://404-hub.vercel.app/api/inject?session=" .. sessionId .. "&game=" .. game.PlaceId
        return HttpService:GetAsync(url)
    end)
    
    if success then
        local data = HttpService:JSONDecode(result)
        if data.execute then
            loadstring(data.execute)()
        end
    end
end)
`;
    
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(protectionCode);
  }
  
  const fakeHtml = `<!DOCTYPE html><html><head><title>404</title><style>body{background:#1a1a1a;color:white;padding:20px;font-family:monospace;}</style></head><body>404 - Script not found</body></html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(fakeHtml);
};
