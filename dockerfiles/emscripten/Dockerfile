# docker build -t ystenzel/emscripten-compiler .
FROM rsippl/emscripten:latest
# FROM ystenzel/bos-transcrypt-compiler:latest

RUN yum update -y && \
	yum install -y npm && \
	yum clean all && \
	npm install -g pm2

ADD api/package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/local/api-emscripten && cp -a /tmp/node_modules /usr/local/api-emscripten

# run build of hello_world.cpp to create libraries: libcxx.a, libcxxabi.bc, libc.bc, dlmalloc.bc
ENV PATH="/opt/emsdk_portable:/opt/emsdk_portable/clang/fastcomp/build_master_64/bin:/opt/emsdk_portable/node/4.1.1_64bit/bin:/opt/emsdk_portable/emscripten/master:${PATH}"
RUN ["emcc","/opt/emsdk_portable/clang/fastcomp/src/tools/clang/utils/perf-training/cxx/hello_world.cpp"]

WORKDIR /usr/local/api-emscripten
ADD api /usr/local/api-emscripten

CMD [ "pm2-docker", "emscripten-compiler.js" ]