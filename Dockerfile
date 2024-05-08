FROM oven/bun:latest
WORKDIR /app

ADD package.json .
ADD bun.lockb .
RUN bun install
ADD index.ts .
ADD tsconfig.json .
ADD src ./src

ADD https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu1804-x86_64-100.9.4.deb /tmp/mongodb-database-tools.deb
RUN apt-get install -y /tmp/mongodb-database-tools.deb
CMD ["bun", "index.ts"]