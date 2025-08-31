const { generateProtection, isValidRobloxRequest } = require('./protection');

module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  if (isValidRobloxRequest(userAgent, req.headers)) {
    try {
      // Get script from environment variable
      const scriptUrl = process.env.SCRIPT_URL;
      const response = await fetch(scriptUrl);
      let scriptContent = await response.text();
      
      // Apply protection wrapper
      const protectedScript = generateProtection(scriptContent);
      
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(protectedScript);
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('-- Error loading script');
    }
  }
  
  // Browser requests - show 404
  const fakeHtml = `<!DOCTYPE html><html><head><title>404</title><style>body{background:#1a1a1a;color:white;padding:20px;font-family:monospace;}</style></head><body>404 - Script not found</body></html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(fakeHtml);
};
