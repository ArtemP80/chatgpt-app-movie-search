@echo off
curl -X POST http://localhost:4000/mcp ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json,text/event-stream" ^
  -d "{""jsonrpc"": ""2.0"", ""id"": ""1"", ""method"": ""tool.invoke"", ""params"": {""tool"": ""getMovies"", ""input"": {""city"": ""Amsterdam"", ""date"": ""2025-11-04""}}}"
pause


