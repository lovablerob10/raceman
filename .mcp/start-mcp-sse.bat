@echo off
cd /d "d:\Pe de chumbo"
npx -y supergateway --stdio "npx -y @modelcontextprotocol/server-filesystem ." --port 8000 --cors
