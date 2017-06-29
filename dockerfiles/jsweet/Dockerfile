# docker build -t ystenzel/jsweet-compiler .
FROM buildpack-deps:jessie

RUN cd /usr/local && \
	curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
	apt-get install nodejs -y && \

	apt-get update -y && \
	# https://gist.github.com/mugli/8720670#gistcomment-1622348
	echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" | tee /etc/apt/sources.list.d/webupd8team-java.list && \
	echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" | tee -a /etc/apt/sources.list.d/webupd8team-java.list && \
	apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys EEA14886 && \
	apt-get update && \
	# aptitude update && \

	# Enable silent install
	echo debconf shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
	echo debconf shared/accepted-oracle-license-v1-1 seen true | debconf-set-selections && \
	apt-get -y install oracle-java8-installer && \
	update-java-alternatives -s java-8-oracle && \
	apt-get install -y oracle-java8-set-default && \

	# apt-get install oracle-java8-installer --yes --force-yes && \
	apt-get install maven -y && \
	# mvn -f jsweet-quickstart/pom.xml generate-sources && \

	# apt-get install -y npm && \
	apt-get clean all && \
	
	npm install -g pm2
	# npm install rethinkdb && \
	# npm install fs && \
	# npm install child_process && \
	# npm install cheerio && \
	# npm install jquery && \
	# npm install jsdom

RUN git clone https://github.com/cincheo/jsweet-quickstart.git && \
	cd jsweet-quickstart && \
	mvn generate-sources

ADD api/package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/local/api-jsweet && cp -a /tmp/node_modules /usr/local/api-jsweet

ADD api /usr/local/api-jsweet
WORKDIR /usr/local/api-jsweet

CMD ["pm2-docker", "jsweet-compiler.js"]

# ADD test.js /usr/local/etc/test.js
# ADD cpp/default.cpp /usr/local/etc/default.cpp



# CMD ["/bin/bash"]