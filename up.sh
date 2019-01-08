#!/bin/sh

git pull
docker-compose build
docker-compose up -d
cp ./nginx.conf /container/nginx/nginx/knightby.com.conf
docker restart nginx
