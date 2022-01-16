FROM debian as builder
LABEL maintainer="Frederic Aoustin <fraoustin@gmail.com>"

RUN apt-get update && apt-get install -y \
        minify \
    && rm -rf /var/lib/apt/lists/* 

RUN mkdir /bambou
COPY . /bambou/
RUN rm -rf /bambou/logs/*
RUN rm -rf /bambou/bambou.db
WORKDIR /bambou/files/codemirror
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/files/css
RUN minify -o . --match=\css *.css
WORKDIR /bambou/files/javascripts
RUN minify -o . --match=\js *.js
WORKDIR /bambou/nodes/code/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/data/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/db/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/foreach/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/groupby/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/htmljinja/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/link/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/log/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/mail/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/subflow/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/synchro/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/transform/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/comment/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodes/mail/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css
WORKDIR /bambou/nodesextra/sample/files
RUN minify -o . --match=\js *.js
RUN minify -o . --match=\css *.css

FROM python:3.8-slim

RUN apt-get update && apt-get install -y \
        build-essential \
        freetds-bin \
        freetds-dev \
        libpq-dev \
        tdsodbc \
        unixodbc \
        unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /data
VOLUME /data
RUN mkdir /db
VOLUME /db

RUN mkdir /bambou
COPY --from=builder /bambou /bambou
RUN rm -rf /bambou/entrypoint.sh

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY bambou.cfg /db/bambou.cfg

RUN pip install -r /bambou/REQUIREMENTS.txt

ENV BAMBOU_PORT 5000
ENV BAMBOU_DEBUG false
ENV BAMBOU_HOST 0.0.0.0
ENV BAMBOU_DIR /db

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bambou"]