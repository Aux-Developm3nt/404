module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const authKey = req.query.auth || '';
  const validAuth = process.env.SCRIPT_AUTH || 'your-secret-key-123';
  
  // Only allow browsers with correct auth key
  const isBrowser = userAgent.includes('Mozilla') || userAgent.includes('Chrome');
  
  if (!isBrowser || authKey !== validAuth) {
    return res.status(403).send('Access Denied');
  }
  
  try {
    const scriptUrl = process.env.SCRIPT_URL;
    const response = await fetch(scriptUrl);
    const scriptContent = await response.text();
    
    // Return the protected loader
    const protectedScript = `
-- Protected Script Loader
-- Only works from legitimate source

local function loadMainScript()
    local encodedScript = "${Buffer.from(scriptContent).toString('base64')}"
    
    local function decodeBase64(data)
        local chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        data = string.gsub(data, '[^'..chars..'=]', '')
        return (data:gsub('.', function(x)
            if (x == '=') then return '' end
            local r,f='',(chars:find(x)-1)
            for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end
            return r;
        end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
            if (#x ~= 8) then return '' end
            local c=0
            for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end
            return string.char(c)
        end))
    end
    
    local decoded = decodeBase64(encodedScript)
    return loadstring(decoded)()
end

-- Block clipboard and HttpGet immediately
if setclipboard then setclipboard = function() end end
if toclipboard then toclipboard = function() end end

local originalHttpGet = game.HttpGet
game.HttpGet = function(self, url, ...)
    if url and url:find("your%-domain%.vercel%.app") then
        error("Access denied")
    end
    return originalHttpGet(self, url, ...)
end

-- Load the real script
spawn(function()
    wait(0.1)
    loadMainScript()
end)
`;
    
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(protectedScript);
    
  } catch (error) {
    return res.status(500).send('-- Error loading script');
  }
};
