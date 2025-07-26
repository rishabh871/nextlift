# Nextlift Deployment

### Pull the latest changes from the git repository
    git pull origin main

### Install node modules
    npm install --legacy-peer-deps

### Compiled .next code
    npm run build

### Run with production mode and PM2
    pm2 start npm --name "frontend" --log-date-format="YYYY-MM-DD HH:mm Z" -- run start

### Run with developer mode(Not use in Production mode)
    npm run dev
