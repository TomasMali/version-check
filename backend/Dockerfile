# Use an official Node.js runtime as a parent image
FROM node:17

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in package.json
RUN npm install

# Make port 3000 available to the world outside this container
EXPOSE 3010

# Define environment variable
ENV NAME World

# Create a directory for file uploads
RUN mkdir -p /uploads

# Run app.js when the container launches
CMD ["node", "server.js"]

# docker build --platform linux/amd64 -t tommal/fis-manager-backend .
# docker run -it -d --restart always --name c-fis-manager-backend -p 3008:3010 tommal/fis-manager-backend

#docker run -it -d --restart always --name c-fis-manager-backend -p 3008:3010 -v /home/telroot/FTP/files/scripts/versions/logs:/uploads tommal/fis-manager-backend
