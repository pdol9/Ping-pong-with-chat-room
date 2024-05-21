#!/bin/sh

cat << EOF > ./srcs/.env
DOMAIN_NAME=localhost

# development or production
NODE_ENV=development

# database
DATABASE_PORT=5432
DATABASE_HOST=database

# backend
BACKEND_PORT=5000
BACKEND_WS_PORT=4000
BACKEND_HOST=backend

# frontend
FRONTEND_PORT=3000
FRONTEND_HOST=frontend

# proxy
PROXY_HOST=proxy

#42API
API42_AUTHORIZE=https://api.
# replace with a different API, like Google,etc.
EOF

cat << EOF > ./srcs/requirements/database/.env
POSTGRES_USER=transcendence
POSTGRES_PASSWORD=password-123!
POSTGRES_DB=nestjs
EOF

cat << EOF > ./srcs/requirements/backend/.env
# same thing here -> replace with a valid API token
# 42API
API42_ID=u-s4t2ud-70995f060d151b04c54e59fbf54bce6a57d876acbdee2de4270c7b9ccc17c2ef
API42_SECRET=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
API42_REDIRECT=https://localhost/callback

# jwt
JWT_SECRET=secret

# 2FA
MFA_APP_NAME=ft_transcendence
EOF

export $(cat srcs/.env | grep DOMAIN_NAME=)

if [ ! -f srcs/requirements/proxy/tools/$DOMAIN_NAME.crt ];
then
	openssl req -x509 -days 365 -nodes -sha256 -newkey rsa:4096 \
			-subj "/C=DE/ST=Lower Saxony/L=Wolfsburg/O=42 School/OU=ft_transcendence" \
			-keyout "srcs/requirements/proxy/tools/$DOMAIN_NAME.key" \
			-out "srcs/requirements/proxy/tools/$DOMAIN_NAME.crt"
fi
