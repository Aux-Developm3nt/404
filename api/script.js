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
      
      // ANTI-SKIDDER PROTECTION
      const protectedScript = `-- Anti-Skid
-- Blocks clipboard theft and decompilation

local executionKey = tostring(math.random(100000, 999999)) .. tostring(tick())

local function blockSkidderFunctions()
    local blockedFunctions = {
        "setclipboard", "toclipboard", "writefile", "saveinstance",
        "decompile", "debug", "getrawmetatable", "getgenv", "getrenv",
        "getfenv", "setfenv", "newcclosure", "hookfunction", "hookmetamethod"
    }
    
    for _, funcName in pairs(blockedFunctions) do
        if _G[funcName] then
            _G[funcName] = function(...)
                game:GetService("StarterGui"):SetCore("SendNotification", {
                    Title = "🔒 Access Denied",
                    Text = "Function " .. funcName .. " is protected",
                    Duration = 3
                })
                warn("🚫 Blocked skidder function: " .. funcName)
                return nil
            end
        end
    end
end

local function antiDebug()
    local mt = getrawmetatable(game)
    local oldNamecall = mt.__namecall
    
    setreadonly(mt, false)
    mt.__namecall = function(self, ...)
        local method = getnamecallmethod()
        local args = {...}
        
        if method == "HttpGet" and tostring(self) == "HttpService" then
            local url = args[1]
            if url and url:find("404%-hub%.vercel%.app") and not url:find("loadstring") then
                warn("🚫 Direct source access blocked!")
                return "-- Access denied"
            end
        end
        
        return oldNamecall(self, ...)
    end
    setreadonly(mt, true)
end

blockSkidderFunctions()
pcall(antiDebug)

local function executeScript()
    local encoder = {
        [1] = function(s) return s:reverse() end,
        [2] = function(s) return s:gsub(".", function(c) return string.char(c:byte() + 1) end) end,
        [3] = function(s) return s end
    }
    
    local method = math.random(1, 3)
    local encoded = "${Buffer.from(scriptContent).toString('base64')}"
    
    spawn(function()
        wait(math.random() * 0.5 + 0.1)
        
        local success, decoded = pcall(function()
            local base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
            local decoded = ""
            encoded = encoded:gsub("[^"..base64Chars.."=]", "")
            
            for i = 1, #encoded, 4 do
                local chunk = encoded:sub(i, i + 3)
                local bits = 0
                local bitCount = 0
                
                for j = 1, #chunk do
                    local char = chunk:sub(j, j)
                    if char ~= "=" then
                        local value = base64Chars:find(char) - 1
                        bits = bits * 64 + value
                        bitCount = bitCount + 6
                    end
                end
                
                while bitCount >= 8 do
                    bitCount = bitCount - 8
                    decoded = decoded .. string.char(math.floor(bits / (2^bitCount)) % 256)
                end
            end
            
            return decoded
        end)
        
        if success and decoded then
            local execSuccess, execError = pcall(function()
                return loadstring(decoded)()
            end)
            
            if not execSuccess then
                warn("Execution error: " .. tostring(execError))
            end
        else
            warn("Decode error")
        end
    end)
end

executeScript()

spawn(function()
    while wait(5) do
        if _G.setclipboard or _G.toclipboard then
            warn("🚫 Clipboard access detected - blocking")
            _G.setclipboard = nil
            _G.toclipboard = nil
        end
    end
end)`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(protectedScript);
      
    } catch (error) {
      console.error('Error:', error);
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Service unavailable');
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
        .math-problem {
            background: #1a1a1a;
            padding: 25px;
            font-size: 24px;
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
        <p>Solve to continue</p>
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
                msg.innerHTML = '<div class="error">❌ Wrong</div>';
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
