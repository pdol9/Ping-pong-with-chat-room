#!/bin/bash

originalfile="/etc/nginx/conf.d/default.conf"
tmpfile=$(mktemp)
cp --attributes-only --preserve $originalfile $tmpfile
cat $originalfile \
 | envsubst '${DOMAIN_NAME}
             ${BACKEND_PORT}
             ${BACKEND_HOST}
             ${FRONTEND_PORT}
             ${FRONTEND_HOST}
             ${BACKEND_WS_PORT}
             ${WS_PORT}
             ${WS_DOMAIN}' \
 > $tmpfile \
 && mv $tmpfile $originalfile

nginx -g "daemon off;"
