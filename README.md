
## Deployment

Currently only local

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   npm install

2. Run the app:
   npm run dev

3. Run the server:
   npx ts-node server.ts


Additional notes:

If there is issue in the server.ts with the following line: import Database from "better-sqlite3";
Run this command to fix it: npm install -D @types/better-sqlite3

If React not working, run these commands: 

npm install react react-dom
npm install -D @types/react @types/react-dom
