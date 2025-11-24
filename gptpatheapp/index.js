const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/api/get-movies', async (req, res) => {
  
    const { city, date } = req.body;
  
  // Translate REST to JSON-RPC
  const jsonRpcRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "getMovies",
      arguments: { city, date }
    }
  };
  
  
  try {
    const response = await axios.post(
      'http://localhost:3000/mcp',
      jsonRpcRequest,
      {
    headers: {
      'Content-Type': 'application/json',  // required
      'Accept': 'application/json, text/event-stream' // accept streaming
    }
  }
    );
    res.json(response.data.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
});

app.listen(3001, () => {
  console.log('Gateway running on port 3001');
});