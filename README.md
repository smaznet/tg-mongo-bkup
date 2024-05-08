## backup mongodb in docker

### 1. Create a docker-compose.yml file

```yaml
  bkup:
    restart: always
    image: { this }:latest
    networks:
      - mongodb # shared network between your db and this container
    environment:
      TELEGRAM_API_ID: 123456 # get these from my.telegram.org
      TELEGRAM_API_HASH: "1234567890abcdef1234567890abcdef"
      FILE_PREFIX: "bkup-"
      DEST_CHAT_ID: "-100123456"
      CRON: "0 0 * * * *" # cron for backup
      OUT_DIR: "output" # tmp directory for backups after backup this folder will be cleaned
      BOT_TOKEN: "" # TOKEN HERE
      MONGO_URI: "mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:27017/${MONGO_DB}?replicaSet=${MONGO_REPLICA_NAME}"
```

### 2. Run the container

```bash
docker-compose up -d bkup
```
