# My Capstone

## Setup

1. Clone the repository: `git clone <repo-link>`

```
`git clone https://github.com/Michelle-Watson/capstone-michelle.git`
```

### Setup Server

1. `cd .\server\`
2. Install dependencies: `npm install`
3. Set environment variables in a `.env` file.

```
PORT=5050
DB_HOST=127.0.0.1
DB_NAME=capstone
DB_USER=root
DB_PASSWORD=rootroot
TWITCH_CLIENT_ID=06jij3imvklkpn1e2npprp1jju5je3
TWITCH_CLIENT_SECRET=u7dmisygpax0rzvteksnfv3i4hxaqu
ACCESS_TOKEN=
```

- `ACCESS_TOKEN` will be generated upon requests to the server

#### Run Server

- Start the server: `npm start`
- Access the server at: `http://localhost:5050`

### Setup Client

1. `cd .\game-finder\`
2. Install dependencies: `npm install`
3. Set environment variables in a `.env` file.

```
VITE_API_URL=http://localhost:5050
```

#### Run Client

- Start the server: `npm run dev`
- Access the app at: `http://localhost:5050`
