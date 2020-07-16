# Short url

Simple node app to generate and handle short urls.
Node server that serves a vue.js app.
Database is mongodb.
Deployment with ansible.

# Setup
Generate self signed certificate: `openssl req -nodes -new -x509 -keyout key.pem -out cert.pem`.
Now you can run the app localy with `docker-compose up -d`.
No docker and/or docker-compose? Go get it its awesome:)

# Deploy
The deployment folder contains a ansible container used for deployment.
For the deployment to work some parameters have to be adjusted.
Add a .env file in the deploy/src folder, content should be similar to the top level .env file but with production values.
Add 001_users.js in the deploy/src folder, content should be similar to the one in mongodb folder.
Add a inventory file with your deployment server to deploy/src/inventories.  

After the configuration run `docker-compose run deploy` inside the deploy folder.
If everything is configured correctly the app gets deployed to the prod server.