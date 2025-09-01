module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const captchaVerified = req.query.verified === 'true';
  const authKey = req.query.auth || '';
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
  console.log(`[${new Date().toISOString()}] ${clientIP} - ${userAgent} - Auth: ${authKey ? 'PROVIDED' : 'NONE'}`);
  
  // Check for authenticated request FIRST
  if (authKey && authKey === process.env.SCRIPT_AUTH) {
    // Authenticated user - serve real script
    console.log(`✅ Authenticated access from: ${clientIP}`);
    
    try {
      const scriptUrl = process.env.SCRIPT_URL;
      
      if (!scriptUrl) {
        console.log('❌ SCRIPT_URL not configured');
        res.setHeader('Content-Type', 'text/plain');
        return res.status(500).send('-- Configuration error: SCRIPT_URL not set');
      }
      
      console.log(`Fetching script from: ${scriptUrl}`);
      const response = await fetch(scriptUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let scriptContent = await response.text();
      console.log(`Script fetched successfully, length: ${scriptContent.length} characters`);
      
      // Add protection wrapper
      const protectedScript = `-- 404 Hub Pro - Authenticated Access
-- Script loaded and protected

-- Success notification
game:GetService("StarterGui"):SetCore("SendNotification", {
    Title = "✅ 404 Hub Pro",
    Text = "Script loaded successfully!",
    Duration = 3
})

-- Block clipboard functions immediately
if setclipboard then 
    setclipboard = function(content) 
        warn("🚫 Clipboard blocked")
        return false 
    end 
end
if toclipboard then 
    toclipboard = function(content) 
        warn("🚫 Clipboard blocked")
        return false 
    end 
end

-- Block HttpGet to our domain
local originalHttpGet = game:GetService("HttpService").HttpGet
game:GetService("HttpService").HttpGet = function(self, url, ...)
    if url and url:find("404%-hub%.vercel%.app") then
        warn("🚫 Source theft blocked: " .. url)
        error("Access denied - Source protection active")
    end
    return originalHttpGet(self, url, ...)
end

print("🔒 Protection systems activated")

-- Execute your actual script:
${scriptContent}

-- Runtime monitoring
spawn(function()
    while wait(5) do
        -- Re-block clipboard if restored
        if _G.setclipboard and typeof(_G.setclipboard) == "function" then
            _G.setclipboard = function() return false end
        end
        if _G.toclipboard and typeof(_G.toclipboard) == "function" then
            _G.toclipboard = function() return false end
        end
    end
end)

print("✅ Script execution completed with protection")`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(protectedScript);
      
    } catch (error) {
      console.error('❌ Script fetch error:', error);
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send(`-- Error loading script: ${error.message}`);
    }
  }
  
  // Detect Roblox/Executor requests (without auth)
  const isRobloxRequest = userAgent.includes('Roblox') || 
                         userAgent.includes('RobloxStudio') ||
                         (!userAgent.includes('Mozilla') && 
                          !userAgent.includes('Chrome') && 
                          !userAgent.includes('Safari') &&
                          !userAgent.includes('Firefox'));
  
  if (isRobloxRequest) {
    // Unauthenticated Roblox request - return fake error
    console.log(`❌ Unauthenticated Roblox request from: ${clientIP}`);
    const fakeErrors = [
      '-- Error: Script not found',
      '-- HTTP 404: Resource unavailable', 
      '-- Server maintenance in progress',
      '-- Access denied: Authentication required',
      '-- Connection timeout occurred'
    ];
    const randomError = fakeErrors[Math.floor(Math.random() * fakeErrors.length)];
    
    res.setHeader('Content-Type', 'text/plain');
    return res.status(404).send(randomError);
  }
  
  // Browser requests get captcha
  if (!captchaVerified) {
    const captchaPage = `<!DOCTYPE html>
<html>
<head>
    <title>Verification Required</title>
    <style>
        body { background: #1a1a1a; color: white; font-family: Arial; text-align: center; padding: 50px; }
        .container { max-width: 400px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
        button { background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Human Verification</h1>
        <p>Please verify that you are human to continue</p>
        <br>
        <button onclick="location.href='?verified=true'">Verify Human</button>
    </div>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(captchaPage);
  }
  
  // Verified browser request - show fake 404
  const fake404 = `<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
<body style="background: #1a1a1a; color: white; font-family: Arial; text-align: center; padding: 50px;">
    <h1 style="color: #ff6b6b; font-size: 72px;">404</h1>
    <h2>Page Not Found</h2>
    <p>The requested resource could not be found.</p>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  return res.status(404).send(fake404);
};
