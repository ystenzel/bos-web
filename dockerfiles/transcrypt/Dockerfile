# docker build -t ystenzel/transcrypt-compiler .
FROM python:latest

# ensure local python is preferred over distribution python
# ENV PATH /usr/local/bin:$PATH

RUN mkdir -p /usr/src/api-transcrypt
RUN	cd /usr/src/api-transcrypt

RUN	pip install transcrypt
# /usr/src/compiler# transcrypt -b -n test.py
RUN	pip install rethinkdb

RUN	apt-get update && \
	
	curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
	apt-get install nodejs -y && \
	npm install -g pm2

WORKDIR /usr/src/api-transcrypt

COPY api /usr/src/api-transcrypt

ADD api/package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/local/api-transcrypt && cp -a /tmp/node_modules /usr/local/api-transcrypt


WORKDIR /usr/local/api-transcrypt
ADD api /usr/local/api-transcrypt

CMD [ "pm2-docker", "transcrypt-compiler.js" ]
