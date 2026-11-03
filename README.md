# ESIM Agent

Claude Code plans and reviews; a cheap Gemini model writes the code. Claude hands each code change to Gemini, which works in its own copy of your project and has to pass a test before the change comes back to you. Your Claude usage goes further, and each task costs a fraction of a cent in Gemini.


## Before you start

- **Claude Code** (the CLI or the desktop app), **Node.js 20+** and **git**. You also need read access to this repo in the MDCPS-ITS org.
- **Your own Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey). Keys are personal: never share one or commit it to a repo.
- **Data:** every job sends that project's code to Google. Only use it on repos you're allowed to send there, and keep real data exports, `.env` files and credentials out of them. The worker can never read `.env` files, but it can read anything else in the repo.

## Install (one time)

Clone it **outside** iCloud Drive or OneDrive, because a synced folder breaks the git copies it makes:

```bash
git clone https://github.com/MDCPS-ITS/esim-agent.git ~/Developer/esim-agent
```

```bash
cd ~/Developer/esim-agent && npm install && npm run build
```

Run setup. Pick **5) Google Gemini**, press Enter for **balanced**, then type your API key (the input is hidden). It checks the key works and adds itself to Claude Code for all your projects:

```bash
node dist/index.js
```

## Use it

1. Open Claude Code in a project. It has to be a git repo **outside** iCloud/OneDrive, and the session must start in the repo's own folder.
2. Run `/esim-agent:allow` once per project and approve the models it lists.
3. Ask Claude for changes as usual. It sends the coding to Gemini; results start with `OK`, `PARTIAL` or `FAIL`.

`/esim-agent:status` shows jobs and spend. `/esim-agent:clean` tidies the job folders.

## Models

| Preset | Writes code with | Price per million tokens (in / out) |
|---|---|---|
| cheapest | gemini-3.5-flash-lite | $0.30 / $2.50 |
| **balanced** (default) | gemini-3.8-flash | $0.75 / $3.75 |
| strongest | gemini-3.1-pro-preview | $2 / $12 |

To switch, run `node dist/index.js login` again and pick another preset.

## Update

```bash
cd ~/Developer/esim-agent && git pull && npm install && npm run build && node dist/index.js
```

## Uninstall

```bash
claude mcp remove -s user esim-agent && claude plugin uninstall esim-agent@esim-agent
```
