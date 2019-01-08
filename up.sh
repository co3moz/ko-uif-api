#!/bin/sh

git pull
docker-compose build
docker-compose up -d
cp ./nginx.conf /container/nginx/nginx/conf.d/knightby.com.conf
docker restart nginx
