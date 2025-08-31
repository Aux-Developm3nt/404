// api/script.js - REPLACE EVERYTHING
module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const captchaVerified = req.query.verified === 'true';
  const showCaptcha = req.query.captcha === 'true';
  
  // Check if request is from Roblox
  const isRobloxRequest = userAgent.includes('Roblox') && !userAgent.includes('Mozilla');
  
  if (isRobloxRequest) {
    // Roblox request - serve the actual script
    try {
      const scriptUrl = process.env.SCRIPT_URL;
      const response = await fetch(scriptUrl);
      let scriptContent = await response.text();
      
      const protectedScript = `-- Anti-theft protection
local blockedFunctions = {"setclipboard", "toclipboard", "writefile", "decompile", "debug"}
for _, func in pairs(blockedFunctions) do 
  if _G[func] then 
    _G[func] = function() 
      game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "🔒 Protected", 
        Text = "Function blocked", 
        Duration = 2
      }) 
    end 
  end 
end

spawn(function() 
  wait(0.1) 
  loadstring([=[${scriptContent}]=])() 
end)`;
      
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(protectedScript);
      
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Error');
    }
  }
  
  // Browser request - check if need to show CAPTCHA
  if (!captchaVerified && !showCaptcha) {
    // Redirect to show CAPTCHA
    const captchaUrl = req.url + (req.url.includes('?') ? '&' : '?') + 'captcha=true';
    return res.redirect(captchaUrl);
  }
  
  if (showCaptcha && !captchaVerified) {
    // Show CAPTCHA page
    const darkCaptchaPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Required</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-image: 
                radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%);
        }
        
        .container {
            background: rgba(30, 30, 30, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid #333;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        
        .logo { 
            font-size: 48px; 
            margin-bottom: 10px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        h1 { 
            color: #ffffff; 
            margin-bottom: 10px;
            font-size: 24px;
        }
        
        p {
            color: #aaa;
            margin-bottom: 30px;
        }
        
        .math-problem {
            background: #1a1a1a;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 25px;
            font-size: 28px;
            margin: 25px 0;
            font-weight: bold;
            color: #4ecdc4;
            font-family: 'Courier New', monospace;
        }
        
        .answer-input {
            background: #1a1a1a;
            border: 2px solid #333;
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-size: 18px;
            width: 120px;
            text-align: center;
            margin: 15px;
            transition: border-color 0.3s;
        }
        
        .answer-input:focus {
            outline: none;
            border-color: #4ecdc4;
        }
        
        .verify-btn {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            margin: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
            font-weight: bold;
        }
        
        .verify-btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
        }
        
        .error { 
            color: #ff6b6b; 
            margin: 15px 0;
            background: rgba(255, 107, 107, 0.1);
            padding: 10px;
            border-radius: 5px;
            border: 1px solid rgba(255, 107, 107, 0.3);
        }
        
        .success { 
            color: #4ecdc4; 
            margin: 15px 0;
            background: rgba(78, 205, 196, 0.1);
            padding: 10px;
            border-radius: 5px;
            border: 1px solid rgba(78, 205, 196, 0.3);
        }
        
        .footer {
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔐</div>
        <h1>Verification Required</h1>
        <p>Solve this math problem to continue</p>
        
        <div class="math-problem" id="mathProblem"></div>
        
        <div>
            <input type="number" class="answer-input" id="answer" placeholder="Answer">
            <br>
            <button class="verify-btn" onclick="verify()">Verify</button>
        </div>
        
        <div id="message"></div>
        
        <div class="footer">404-hub.vercel.app</div>
    </div>

    <script>
        let correctAnswer = 0;
        
        function generateProblem() {
            const num1 = Math.floor(Math.random() * 15) + 5;
            const num2 = Math.floor(Math.random() * 15) + 5;
            const operations = ['+', '-'];
            const op = operations[Math.floor(Math.random() * operations.length)];
            
            if (op === '+') {
                correctAnswer = num1 + num2;
                document.getElementById('mathProblem').textContent = num1 + ' + ' + num2 + ' = ?';
            } else {
                const bigger = Math.max(num1, num2);
                const smaller = Math.min(num1, num2);
                correctAnswer = bigger - smaller;
                document.getElementById('mathProblem').textContent = bigger + ' - ' + smaller + ' = ?';
            }
        }
        
        function verify() {
            const userAnswer = parseInt(document.getElementById('answer').value);
            const messageDiv = document.getElementById('message');
            
            if (isNaN(userAnswer)) {
                messageDiv.innerHTML = '<div class="error">❌ Please enter a number</div>';
                return;
            }
            
            if (userAnswer === correctAnswer) {
                messageDiv.innerHTML = '<div class="success">✅ Correct! Redirecting...</div>';
                setTimeout(() => {
                    // Remove captcha=true and add verified=true
                    const url = new URL(window.location);
                    url.searchParams.delete('captcha');
                    url.searchParams.set('verified', 'true');
                    window.location.href = url.toString();
                }, 1500);
            } else {
                messageDiv.innerHTML = '<div class="error">❌ Wrong answer. Try again.</div>';
                generateProblem();
                document.getElementById('answer').value = '';
            }
        }
        
        document.getElementById('answer').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') verify();
        });
        
        // Initialize
        generateProblem();
        document.getElementById('answer').focus();
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(darkCaptchaPage);
  }
  
  // CAPTCHA verified - show your current 404 style
  const fakeHtml = `<!DOCTYPE html><html><head><title>404</title><style>body{background:#1a1a1a;color:white;padding:20px;font-family:monospace;}</style></head><body>404 - Script not found</body></html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(fakeHtml);
};
