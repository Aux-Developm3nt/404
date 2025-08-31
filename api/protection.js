// api/protection.js
const generateProtection = (scriptContent) => {
  return `
-- Anti-Clipboard Protection by 404-Hub
local blockedFunctions = {
  "setclipboard", 
  "toclipboard", 
  "writefile", 
  "decompile", 
  "debug",
  "HttpGetSetClipBoard",
  "HttpGetAsync",
  "readfile",
  "saveinstance"
}

-- Block the functions
for _, funcName in pairs(blockedFunctions) do
  if _G[funcName] then 
    _G[funcName] = function(...) 
      game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "🚫 Protected", 
        Text = "Function blocked: " .. funcName, 
        Duration = 3
      })
      return nil
    end 
  end
  
  -- Block getgenv din
  if getgenv and getgenv()[funcName] then
    getgenv()[funcName] = function() return nil end
  end
end

-- Execute actual script after protection
spawn(function() 
  wait(0.1) 
  loadstring([=[${scriptContent}]=])() 
end)
`;
};

const isValidRobloxRequest = (userAgent, headers) => {
  // Check if legit Roblox request
  const isRoblox = userAgent.includes('Roblox') || 
                   userAgent.includes('RobloxStudio') || 
                   (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome'));
  
  // Block suspicious agents na pwedeng clipboard tools
  const suspiciousAgents = ['curl', 'wget', 'python', 'postman', 'clipboard', 'HttpGetSetClipBoard'];
  const isSuspicious = suspiciousAgents.some(agent => 
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );
  
  return isRoblox && !isSuspicious;
};

module.exports = {
  generateProtection,
  isValidRobloxRequest
};
