module.exports = async (req, res) => {
  const authKey = req.query.auth || '';
  const userAgent = req.headers['user-agent'] || '';
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Your secret key
  const validAuth = process.env.SCRIPT_AUTH || 'zRkaP4c15osmNs27us';
  
  // Log all attempts
  console.log(`[LOAD] ${clientIP} - ${userAgent} - Auth: ${authKey}`);
  
  // Check if auth key is correct
  if (authKey !== validAuth) {
    console.log(`❌ Invalid auth attempt: ${authKey}`);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(403).send('-- Access denied: Invalid authentication');
  }
  
  // Check if request is from Roblox/Executor
  const isRobloxRequest = userAgent.includes('Roblox') || 
                         userAgent.includes('RobloxStudio') ||
                         (!userAgent.includes('Mozilla') && 
                          !userAgent.includes('Chrome') && 
                          !userAgent.includes('Safari'));
  
  if (!isRobloxRequest) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(403).send('Access Denied - Browser requests not allowed');
  }
  
  try {
    // Fetch your real script
    const scriptUrl = process.env.SCRIPT_URL;
    
    if (!scriptUrl) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Configuration error');
    }
    
    const response = await fetch(scriptUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    let scriptContent = await response.text();
    
    // Return your actual script with protection
    const finalScript = `-- 404 Hub Pro - Authenticated
-- Anti-skid protection active

${scriptContent}

-- Runtime protection
spawn(function()
    while wait(2) do
        if _G.setclipboard then
            _G.setclipboard = function() return false end
        end
        if _G.toclipboard then
            _G.toclipboard = function() return false end
        end
    end
end)`;

    console.log(`✅ Script served to: ${clientIP} with valid auth`);
    
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(finalScript);
    
  } catch (error) {
    console.error('Script fetch error:', error);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('-- Error loading script');
  }
};
