# FROM node:18-alpine

# # Create app directory
# WORKDIR /usr/src/app

# # Install app dependencies
# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# # where available (npm@5+)
# COPY package*.json ./

# ENV DD_ENV=none
# ENV DD_AGENT_HOST=datadog-agent
# ENV DD_TRACE_AGENT_PORT=8126
# ENV DD_LOGS_INJECTION=true
# ENV DD_SERVICE=user-app


# RUN npm install
# # If you are building your code for production
# # RUN npm ci --only=production

# # Bundle app source
# COPY . .


# EXPOSE 8000

#  CMD [ "node", "index.js" ]

# CMD [ "node", "-r",  "index.js" ]


# NEW_RELIC_APP_NAME="" NEW_RELIC_LICENSE_KEY=abc08e4b4a99c90ae61ab6560c71d9a5FFFFNRAL node -r newrelic YOUR_MAIN_FILENAME.js


FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV DD_ENV=none
ENV DD_AGENT_HOST=datadog-agent
ENV DD_TRACE_AGENT_PORT=8126
ENV DD_LOGS_INJECTION=true
ENV DD_SERVICE=nodejs
ENV DD_DBM_PROPAGATION_MODE=full
ENV DD_VERSION=1.0.3
ENV DD_PROFILING_ENABLED=true
ENV DD_PROFILING_TIMELINE_ENABLED=true
# ENV DD_APM_ENABLED=true
# Install dependencies


ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA
ENV DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} 
ENV DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

RUN npm install dd-trace --save

RUN npm install

RUN npm install -g nodemon

COPY . .

EXPOSE 8000

CMD ["nodemon", "./bin/www"]
