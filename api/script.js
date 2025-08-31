module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  console.log('User-Agent:', userAgent);
  console.log('Headers:', req.headers);
  
  // Detect Roblox/Executor requests - BYPASS CAPTCHA for these
  const isRobloxRequest = userAgent.includes('Roblox') || 
                         userAgent.includes('RobloxStudio') ||
                         (!userAgent.includes('Mozilla') && 
                          !userAgent.includes('Chrome') && 
                          !userAgent.includes('Safari') &&
                          !userAgent.includes('Edge'));
  
  console.log('Is Roblox request:', isRobloxRequest);
  
  if (isRobloxRequest) {
    // Roblox/Executor request - DIRECTLY serve script (no CAPTCHA needed)
    try {
      const scriptUrl = process.env.SCRIPT_URL;
      
      if (!scriptUrl) {
        console.error('SCRIPT_URL not set');
        res.setHeader('Content-Type', 'text/plain');
        return res.status(500).send('-- Error: Configuration missing');
      }
      
      console.log('Fetching from:', scriptUrl);
      const response = await fetch(scriptUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let scriptContent = await response.text();
      console.log('Script loaded, length:', scriptContent.length);
      
      // Simple protection wrapper
      const wrappedScript = `-- Protected Script Loader
print("🔄 Loading script...")

spawn(function()
  wait(0.1)
  local success, err = pcall(function()
    ${scriptContent}
  end)
  
  if success then
    print("✅ Script loaded successfully!")
  else
    warn("❌ Script error: " .. tostring(err))
  end
end)`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send(wrappedScript);
      
    } catch (error) {
      console.error('Fetch error:', error);
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Fetch error: ' + error.message);
    }
  }
  
  // Browser requests - check for CAPTCHA verification
  const captchaVerified = req.query.verified === 'true';
  
  if (!captchaVerified) {
    // Show CAPTCHA to browsers only
    const captchaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Required</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(30, 30, 30, 0.9);
            border: 1px solid #333;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        .logo { font-size: 48px; margin-bottom: 20px; }
        h1 { margin-bottom: 10px; }
        p { color: #aaa; margin-bottom: 30px; }
        .math-problem {
            background: #1a1a1a;
            border: 2px solid #333;
            padding: 25px;
            font-size: 28px;
            color: #4ecdc4;
            border-radius: 8px;
            margin: 20px 0;
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
            margin: 10px;
        }
        .error { color: #ff6b6b; margin: 15px 0; }
        .success { color: #4ecdc4; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔐</div>
        <h1>Verification Required</h1>
        <p>Complete this verification to continue</p>
        
        <div class="math-problem" id="problem"></div>
        
        <input type="number" class="answer-input" id="answer" placeholder="Answer">
        <br>
        <button class="verify-btn" onclick="verify()">Verify</button>
        
        <div id="message"></div>
    </div>

    <script>
        let correctAnswer = 0;
        
        function generateProblem() {
            const a = Math.floor(Math.random() * 15) + 5;
            const b = Math.floor(Math.random() * 15) + 5;
            const op = Math.random() < 0.5 ? '+' : '-';
            
            if (op === '+') {
                correctAnswer = a + b;
                document.getElementById('problem').textContent = a + ' + ' + b + ' = ?';
            } else {
                const big = Math.max(a, b);
                const small = Math.min(a, b);
                correctAnswer = big - small;
                document.getElementById('problem').textContent = big + ' - ' + small + ' = ?';
            }
        }
        
        function verify() {
            const answer = parseInt(document.getElementById('answer').value);
            const msg = document.getElementById('message');
            
            if (isNaN(answer)) {
                msg.innerHTML = '<div class="error">❌ Enter a number</div>';
                return;
            }
            
            if (answer === correctAnswer) {
                msg.innerHTML = '<div class="success">✅ Correct! Redirecting...</div>';
                setTimeout(() => {
                    window.location.href = '?verified=true';
                }, 1000);
            } else {
                msg.innerHTML = '<div class="error">❌ Wrong answer</div>';
                generateProblem();
                document.getElementById('answer').value = '';
            }
        }
        
        document.getElementById('answer').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') verify();
        });
        
        generateProblem();
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(captchaHtml);
  }
  
  // Verified browser - show fake 404
  const fake404 = `<!DOCTYPE html>
<html>
<head>
    <title>404 - Not Found</title>
    <style>
        body {
            background: #1a1a1a;
            color: white;
            padding: 40px;
            text-align: center;
            font-family: monospace;
        }
        .code { font-size: 72px; color: #ff6b6b; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="code">404</div>
    <h1>Script not found</h1>
    <p>The requested resource could not be located.</p>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  return res.status(404).send(fake404);
};
