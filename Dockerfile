FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM httpd:alpine

COPY --from=build /app/dist /usr/local/apache2/htdocs/

# Copy .htaccess for React Router support
COPY .htaccess /usr/local/apache2/htdocs/.htaccess

RUN echo "OK" > /usr/local/apache2/htdocs/health.html

RUN sed -i '/LoadModule rewrite_module/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's/AllowOverride None/AllowOverride All/g' /usr/local/apache2/conf/httpd.conf
    
EXPOSE 80
