 #!/bin/sh

 docker run --rm -it -v /container/nginx/html/knightby.com:/certs -v /container/certbot:/etc/letsencrypt certbot/certbot certonly --webroot -w /certs -d uif.knightby.com