# Pong game with a chat room

## Description

This is the final project in 42 curriculum. It is a fullstack web application set up
using:
* docker-compose
* webserver (nginx)
* frontend (Next.js, TypeScript)
* backend (NestJS, TypeScript)
* database (postgreSQL)

### Features

* Pong game:
	- multiplayer
	- singleplayer
* Administration:
	- moderate chatrooms: ban, block, grant elevated privileges to a user, etc.
* User account:
	- account login using 42 (OAuth) account
	- (dis)enable 2FA for login
	- change your avatar (picture), profile, etc.
* real-time chatroom:
    - direct (private) messaging
	- invite users to a game or a chat group
	- send friend requests
	- block users
    - join or create group chats

## Install

For the clean (first) install there are several requirements necessary, under section **Hosting**.
In order to successfully run the web app, you need to *configure/edit* script and then run it
```bash
./setup.sh
```

By running command below you will build the docker image for the project and run
the container
```bash
make
```

### Hosting

For app hosting there are few prerequisites:
* host machine
* certificate
* .env file (credentials)

Web app can be easily hosted on any machine via localhost. For this part setup script does not
need to be changed.

Next part concerns webserver, i.e. proxy and certificate which is necessary for the secure
connection on port 443, which is configured as a default one. If none is provided, it can be
generated by running setup scrip. In this case credentials should be updated. Otherwise, a
preexsisting one can be used (in directory: srcs/requirements/proxy/tools/).

To deploy this app on a cloud, you still need to follow procedure above with adequately
configured setup script.

## Usage

### Access on a local network

For a user who wants to access the app on the local network (same WiFi) needs to
know the local IP address of the host machine and use it in a browser as a domain (name).

### Access on a cloud hosted app

Similar applies to a cloud hosted app where user needs to know either public IP address
or domain name of the hosted website.