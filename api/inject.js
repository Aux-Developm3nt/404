module.exports = async (req, res) => {
  const sessionId = req.query.session;
  const gameId = req.query.game;
  const userId = req.query.user;
  
  // This is where YOU control what gets executed
  // The actual script content is fetched here but NEVER sent to client
  
  try {
    // Get your actual script from pastefy (but keep it on server)
    const scriptUrl = process.env.SCRIPT_URL;
    const response = await fetch(scriptUrl);
    const actualScript = await response.text();
    
    // Log the request (optional)
    console.log(`Session: ${sessionId}, Game: ${gameId}, User: ${userId}`);
    
    // Send ONLY what you want the client to execute
    const serverResponse = {
      execute: actualScript, // This sends your script to execute
      terminate: false, // Set to true to stop the client
      timestamp: Date.now()
    };
    
    // Optional: Add game-specific checks
    if (gameId && actualScript.includes('SUPPORTED_GAMES')) {
      // Your script will handle game compatibility
      res.json(serverResponse);
    } else {
      // For unsupported games, send nothing or send error
      res.json({
        execute: 'print("Game not supported")',
        terminate: true
      });
    }
    
  } catch (error) {
    // If can't fetch script, send error
    res.json({
      execute: 'game:GetService("StarterGui"):SetCore("SendNotification", {Title = "Error", Text = "Failed to load script", Duration = 3})',
      terminate: true
    });
  }
};
