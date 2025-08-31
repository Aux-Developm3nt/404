// api/script.js
module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const captchaVerified = req.query.verified === 'true';
  
  // Check if request is from Roblox
  const isRobloxRequest = userAgent.includes('Roblox') && !userAgent.includes('Mozilla');
  
  if (isRobloxRequest) {
    // Roblox request - serve the script with fake 404 HTML
    try {
      const scriptUrl = process.env.SCRIPT_URL;
      const response = await fetch(scriptUrl);
      let scriptContent = await response.text();
      
      const fakeHtmlWithScript = `<!DOCTYPE html>
<html>
<head><title>404 - Script not found</title></head>
<body>404 - Script not found</body>
<script>
-- Anti-theft protection
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
end)
</script>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(fakeHtmlWithScript);
      
    } catch (error) {
      return res.status(500).send('<!DOCTYPE html><html><body>404 - Script not found</body></html>');
    }
  }
  
  // Browser request
  if (!captchaVerified) {
    // Show CAPTCHA first
    const captchaPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Required</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        
        .logo { font-size: 48px; margin-bottom: 10px; }
        h1 { color: #333; margin-bottom: 20px; }
        
        .math-problem {
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            font-size: 24px;
            margin: 20px 0;
            font-weight: bold;
        }
        
        .answer-input {
            padding: 15px;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            font-size: 18px;
            width: 120px;
            text-align: center;
            margin: 10px;
        }
        
        .verify-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
        }
        
        .verify-btn:hover { transform: translateY(-2px); }
        
        .error { color: #dc3545; margin: 10px 0; }
        .success { color: #28a745; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔐</div>
        <h1>Verification Required</h1>
        <p>Solve this simple math problem to continue:</p>
        
        <div class="math-problem" id="mathProblem"></div>
        
        <div>
            <input type="number" class="answer-input" id="answer" placeholder="Answer">
            <br>
            <button class="verify-btn" onclick="verify()">Verify</button>
        </div>
        
        <div id="message"></div>
    </div>

    <script>
        let correctAnswer = 0;
        
        function generateProblem() {
            const num1 = Math.floor(Math.random() * 20) + 1;
            const num2 = Math.floor(Math.random() * 20) + 1;
            const operations = ['+', '-'];
            const op = operations[Math.floor(Math.random() * operations.length)];
            
            if (op === '+') {
                correctAnswer = num1 + num2;
                document.getElementById('mathProblem').textContent = num1 + ' + ' + num2 + ' = ?';
            } else {
                correctAnswer = Math.abs(num1 - num2);
                const bigger = Math.max(num1, num2);
                const smaller = Math.min(num1, num2);
                document.getElementById('mathProblem').textContent = bigger + ' - ' + smaller + ' = ?';
            }
        }
        
        function verify() {
            const userAnswer = parseInt(document.getElementById('answer').value);
            const messageDiv = document.getElementById('message');
            
            if (userAnswer === correctAnswer) {
                messageDiv.innerHTML = '<div class="success">✅ Correct! Redirecting...</div>';
                setTimeout(() => {
                    window.location.href = window.location.pathname + '?verified=true';
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
        
        generateProblem();
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(captchaPage);
  }
  
  // CAPTCHA verified - show fake 404
  const fake404 = `<!DOCTYPE html>
<html>
<head>
    <title>404 - Not Found</title>
    <style>
        body { 
            background: #1a1a1a; 
            color: white; 
            padding: 50px; 
            font-family: monospace; 
            text-align: center;
        }
        .error { color: #ff6b6b; font-size: 48px; }
        .message { font-size: 18px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="error">404</div>
    <div class="message">Script not found</div>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  return res.status(404).send(fake404);
};
