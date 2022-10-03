#! /usr/bin/sh

set -xe

curl -X POST "https://maneiroesturismo.fly.dev/migrate-db?token=$(fly auth token)"