FROM		nginx:1.23-bullseye

RUN			rm -f /etc/nginx/conf.d/default.conf

COPY		./conf/default.conf /etc/nginx/conf.d/default.conf
COPY		./tools/ /etc/nginx/ssl/
COPY		./conf/start_container.sh /tmp/start_container.sh

RUN			chmod +x /tmp/start_container.sh

CMD			["/tmp/start_container.sh"]
