#!/bin/sh

cp ./nginx.conf /container/nginx/nginx/conf.d/knightby.com.conf
docker restart nginx
