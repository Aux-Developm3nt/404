module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const captchaVerified = req.query.verified === 'true';
  const authKey = req.query.auth || '';
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
  console.log(`[${new Date().toISOString()}] ${clientIP} - ${userAgent} - Auth: ${authKey}`);
  
  // Check for authenticated request first
  if (authKey === 'zRkaP4c15osmNs27us') {
    // Authenticated user - serve real script
    try {
      const scriptUrl = process.env.SCRIPT_URL;
      
      if (!scriptUrl) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(500).send('-- Configuration error: SCRIPT_URL not set');
      }
      
      const response = await fetch(scriptUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      let scriptContent = await response.text();
      
      // Add basic protection
      const protectedScript = `-- 404 Hub Pro - Authenticated Access
-- Script loaded successfully

game:GetService("StarterGui"):SetCore("SendNotification", {
    Title = "✅ 404 Hub",
    Text = "Script loaded successfully!",
    Duration = 3
})

-- Block clipboard
if setclipboard then setclipboard = function() return false end end
if toclipboard then toclipboard = function() return false end end

-- Your script:
${scriptContent}`;

      console.log(`✅ Authenticated user served: ${clientIP}`);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send(protectedScript);
      
    } catch (error) {
      console.error('Script fetch error:', error);
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Error: ' + error.message);
    }
  }
  
  // Detect Roblox/Executor requests (without auth)
  const isRobloxRequest = userAgent.includes('Roblox') || 
                         (!userAgent.includes('Mozilla') && 
                          !userAgent.includes('Chrome') && 
                          !userAgent.includes('Safari'));
  
  if (isRobloxRequest) {
    // Unauthenticated Roblox request - return fake error
    console.log(`❌ Unauthenticated Roblox request from: ${clientIP}`);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(404).send('-- Error: Script not found');
  }
  
  // Browser requests
  if (!captchaVerified) {
    // Return captcha page
    const captchaPage = `<!DOCTYPE html>
<html>
<head><title>Verification Required</title></head>
<body style="background: #1a1a1a; color: white; text-align: center; padding: 50px;">
  <h1>🔐 Verification Required</h1>
  <p>Complete verification to continue</p>
  <button onclick="location.href='?verified=true'">Verify</button>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(captchaPage);
  }
  
  // Verified browser request - show fake 404
  res.setHeader('Content-Type', 'text/html');
  return res.status(404).send(`
    <!DOCTYPE html>
    <html><head><title>404 Not Found</title></head>
    <body style="background: #1a1a1a; color: white; text-align: center; padding: 50px;">
      <h1>404 - Page Not Found</h1>
    </body></html>
  `);
};
