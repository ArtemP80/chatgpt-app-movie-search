import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");


const server = new McpServer({
    name: 'demo-server',
    version: '1.0.0'
});



server.registerTool(
  'getMovies',
  {
    title: 'Get Movies',
    description: 'Returns a list of movies playing in a city on a specific date',
    inputSchema: { city: z.string(), date: z.string() },
    outputSchema: { result: z.string() }
  },
  async ({ city, date }) => {
    const movies = [
      { title: 'Dune: Part Two', time: '18:30' },
      { title: 'Joker: Folie à Deux', time: '20:15' },
      { title: 'Inside Out 2', time: '16:45' },
    ];
    
    const output = { result: `Movies in ${city} on ${date}: ${movies.map((m) => m.title).join(", ")}` };

    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }
);


server.registerTool(
    'add',
    {
        title: 'Addition Tool',
        description: 'Add two numbers',
        inputSchema: { a: z.number(), b: z.number() },
        outputSchema: { result: z.number() }
    },
    async ({ a, b }) => {
        const output = { result: a + b };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

server.registerTool(
    'fetch-weather',
    {
        title: 'Weather Fetcher',
        description: 'Get weather data for a city',
        inputSchema: { city: z.string() },
        outputSchema: { temperature: z.number(), conditions: z.string() }
    },
    async ({ city }) => {
        const response = await fetch(`https://api.weather.com/${city}`);
        const data = await response.json();
        const output = { temperature: data.temp, conditions: data.conditions };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);


server.registerResource(
    'greeting',
    new ResourceTemplate('greeting://{name}', { list: undefined }),
    {
        title: 'Greeting Resource', // Display name for UI
        description: 'Dynamic greeting generator'
    },
    async (uri, { name }) => ({
        contents: [
            {
                uri: uri.href,
                text: `Hello, ${name}!`
            }
        ]
    })
);


const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {

    const transport = new StreamableHTTPServerTransport({
        enableJsonResponse: true,
        sessionIdGenerator: undefined,
        enableDnsRebindingProtection: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

app.get("/", (req, res) => res.send("✅ Hello Movie MCP Server is running"));

app.get("/ui-test", (req, res) => {
  res.sendFile(path.join(rootDir, "ui", "test.html"));
});


app.get("/test", async (req, res) => {
  const city = req.query.city || "Amsterdam";
  const date = req.query.date || "2025-11-04";
  try {
    const tool = server.tool.get("getMovies");
    const result = await tool.handler({ city, date });
    res.json(result.structuredContent);
  } catch (err) {
    console.error("❌ Test endpoint error:", err);
    res.status(500).json({ error: err.message });
  }
});





app.get("/client", (req, res) => {
  res.sendFile(path.join(__dirname, "client.html"));
});


const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});