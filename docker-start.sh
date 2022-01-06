#!/bin/bash

npm run prisma:migrate:deploy
node build/index.js
