echo "starting the docker environment"
docker-compose -f ./resources/docker-compose.yml up -d keycloak
bash ./resources/wait.sh
sleep 5
docker-compose -f ./resources/docker-compose.yml up -d server
sleep 5
