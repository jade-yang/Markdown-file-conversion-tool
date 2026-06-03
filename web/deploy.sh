#!/bin/bash

set -e

echo "进入项目目录..."
cd /root/markdown1

echo "拉取最新代码..."
git pull

echo "重新构建并启动容器..."
docker compose up -d --build

echo "当前容器状态："
docker compose ps

echo "部署完成！"