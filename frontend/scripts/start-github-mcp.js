const { spawn } = require('child_process');
require('dotenv').config({ path: '../.env.server' });

const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!githubToken) {
  console.error('Error: GITHUB_PERSONAL_ACCESS_TOKEN is not set in .env.server');
  process.exit(1);
}

const command = 'docker';
const args = [
  'run',
  '-i',
  '--rm',
  '-e',
  `GITHUB_PERSONAL_ACCESS_TOKEN=${githubToken}`,
  'ghcr.io/github/github-mcp-server'
];

const child = spawn(command, args, { stdio: 'inherit' });

child.on('error', (error) => {
  console.error(`Failed to start GitHub MCP server: ${error}`);
});

child.on('close', (code) => {
  console.log(`GitHub MCP server exited with code ${code}`);
});
