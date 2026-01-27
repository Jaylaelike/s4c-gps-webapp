FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY index.html script.js styles.css /app/
COPY *_S4C_last15min.csv /app/

# Install a simple HTTP server
RUN npm install -g http-server

# Create a custom server config to disable caching for CSV files
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'http-server -p 3000 -c-1 --cors' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
