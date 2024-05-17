include ./srcs/.env

DOCKER		= docker-compose -f ./srcs/${NODE_ENV}.docker-compose.yml --env-file ./srcs/.env

all:		back

setup:
			./setup.sh

back:
			${DOCKER} up --build -d

fore:
			$(DOCKER) up --build

re:
			$(DOCKER) restart

clean:
			$(DOCKER) down

fclean:
			$(DOCKER) down -v

cr:			fclean all

.PHONY:		all setup back fore re clean fclean cr
