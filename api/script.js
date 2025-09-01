module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Check if request is from Roblox
  const isRobloxRequest = userAgent.includes('Roblox') || 
                         (!userAgent.includes('Mozilla') && 
                          !userAgent.includes('Chrome') && 
                          !userAgent.includes('Safari'));
  
  if (isRobloxRequest) {
    // NEVER RETURN RAW SCRIPT - RETURN FAKE ERROR INSTEAD
    const fakeResponses = [
      '-- Error: Script not found',
      '-- Server maintenance in progress',
      '-- Access denied: Invalid token',
      '-- HTTP 404: Resource not available',
      '-- Connection timeout occurred'
    ];
    
    const randomResponse = fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
    
    res.setHeader('Content-Type', 'text/plain');
    return res.status(404).send(randomResponse);
  }
  
  // Browser requests get 404 page
  res.setHeader('Content-Type', 'text/html');
  return res.status(404).send(`
    <!DOCTYPE html>
    <html><head><title>404 Not Found</title></head>
    <body><h1>404 - Page Not Found</h1></body></html>
  `);
};
