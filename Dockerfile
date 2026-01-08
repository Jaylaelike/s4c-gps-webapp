FROM nginx:alpine

# Create directory for dynamic data
RUN mkdir -p /usr/share/nginx/html/data

# Copy static files (excluding data.csv to avoid caching)
COPY index.html script.js styles.css /usr/share/nginx/html/

# Copy data.csv separately to enable dynamic updates
COPY data.csv /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]