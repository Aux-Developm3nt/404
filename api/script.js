module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const captchaVerified = req.query.verified === 'true';
  
  console.log('User-Agent:', userAgent);
  
  // Detect Roblox/Executor requests
  const isRobloxRequest = userAgent.includes('Roblox') || 
                         (!userAgent.includes('Mozilla') && 
                          !userAgent.includes('Chrome') && 
                          !userAgent.includes('Safari'));
  
  if (isRobloxRequest) {
    try {
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
      
      // SIMPLE BUT EFFECTIVE Anti-Skidder Protection
      const protectedScript = `-- Anti-Skidder Protection
-- Prevents clipboard theft and source extraction

-- Immediately block skidder functions
local function blockSkidders()
    local blocked = {"setclipboard", "toclipboard", "writefile", "saveinstance"}
    for _, func in pairs(blocked) do
        if _G[func] then
            _G[func] = function()
                warn("🚫 " .. func .. " blocked!")
                return nil
            end
        end
    end
end

-- Execute protection first
blockSkidders()

-- Create execution environment
local function executeProtected()
    -- Random delay to prevent timing attacks
    wait(math.random(1, 3) / 10)
    
    -- Execute in protected environment
    local success, error = pcall(function()
        ${scriptContent}
    end)
    
    if not success then
        warn("Script error: " .. tostring(error))
    end
end

-- Start protected execution
spawn(executeProtected)

-- Continuous anti-tampering
spawn(function()
    while wait(2) do
        blockSkidders()
    end
end)

-- Fake source for skidders who try to print/copy
_G._SCRIPT_SOURCE = "-- Nice try! This is fake source code lol"`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send(protectedScript);
      
    } catch (error) {
      console.error('Error:', error);
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Service error');
    }
  }
  
  // Browser requests - CAPTCHA protection
  if (!captchaVerified) {
    const captchaPage = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verification Required</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(30, 30, 30, 0.9);
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            border: 1px solid #333;
        }
        .logo { font-size: 48px; margin-bottom: 20px; }
        h1 { margin-bottom: 10px; }
        p { color: #aaa; margin-bottom: 30px; }
        .math-problem {
            background: #1a1a1a;
            padding: 25px;
            font-size: 24px;
            color: #4ecdc4;
            border-radius: 8px;
            margin: 20px 0;
            border: 2px solid #333;
        }
        .answer-input {
            background: #1a1a1a;
            border: 2px solid #333;
            color: white;
            padding: 15px;
            border-radius: 8px;
            width: 120px;
            text-align: center;
            margin: 10px;
        }
        .verify-btn {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            cursor: pointer;
            margin: 15px;
        }
        .error { color: #ff6b6b; margin: 10px; }
        .success { color: #4ecdc4; margin: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔐</div>
        <h1>Human Verification</h1>
        <p>Complete verification to continue</p>
        <div class="math-problem" id="problem"></div>
        <input type="number" class="answer-input" id="answer" placeholder="?">
        <br>
        <button class="verify-btn" onclick="verify()">Verify</button>
        <div id="message"></div>
    </div>
    <script>
        let ans = 0;
        function newProblem() {
            const a = Math.floor(Math.random() * 15) + 5;
            const b = Math.floor(Math.random() * 15) + 5;
            const op = Math.random() < 0.5;
            if (op) {
                ans = a + b;
                document.getElementById('problem').textContent = a + ' + ' + b + ' = ?';
            } else {
                const big = Math.max(a, b), small = Math.min(a, b);
                ans = big - small;
                document.getElementById('problem').textContent = big + ' - ' + small + ' = ?';
            }
        }
        function verify() {
            const input = parseInt(document.getElementById('answer').value);
            const msg = document.getElementById('message');
            if (isNaN(input)) {
                msg.innerHTML = '<div class="error">❌ Enter number</div>';
                return;
            }
            if (input === ans) {
                msg.innerHTML = '<div class="success">✅ Verified!</div>';
                setTimeout(() => location.href = '?verified=true', 1000);
            } else {
                msg.innerHTML = '<div class="error">❌ Wrong answer</div>';
                newProblem();
                document.getElementById('answer').value = '';
            }
        }
        document.getElementById('answer').addEventListener('keypress', e => {
            if (e.key === 'Enter') verify();
        });
        newProblem();
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(captchaPage);
  }
  
  // Verified - show fake 404
  res.setHeader('Content-Type', 'text/html');
  return res.status(404).send(`<!DOCTYPE html>
<html><head><title>404</title><style>body{background:#1a1a1a;color:white;padding:40px;text-align:center;}</style></head>
<body><h1 style="font-size:72px;color:#ff6b6b;">404</h1><p>Script not found</p></body></html>`);
};
