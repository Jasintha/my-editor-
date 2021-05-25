From nginx

COPY default.conf  /etc/nginx/conf.d/default.conf

COPY target/generated-resources/public /var/www/editor
