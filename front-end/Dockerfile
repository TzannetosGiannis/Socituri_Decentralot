from node:20.9
WORKDIR /app/
COPY . /app
RUN npm install
RUN npm run build
ENTRYPOINT npm run start
