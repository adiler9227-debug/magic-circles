#!/bin/bash
# автообновление игры с GitHub (запускается раз в 2 минуты)
cd /opt/magic-circles || exit 1
git fetch -q origin
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  git reset -q --hard origin/main
  systemctl restart magic
fi
