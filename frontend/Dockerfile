# use an official Node.js image as the base
FROM node:22-alpine AS build

# set working directory inside the container
WORKDIR /usr/src/app

# copy package.json and package-lock.json
COPY ./package*.json ./

# install dependencies
RUN npm install

# copy the entire project
COPY . .

# build the React app
RUN npm run build

# expose port 5173
EXPOSE 5173

# start the development server
CMD ["npm", "run", "dev"]