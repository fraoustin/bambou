FROM debian as builder
LABEL maintainer="Frederic Aoustin <fraoustin@gmail.com>"

RUN apt-get update && apt-get install -y \
        minify \
    && rm -rf /var/lib/apt/lists/* 

RUN mkdir /bambou
RUN mkdir /bambou/files
COPY ./files/ /bambou/files/
WORKDIR /bambou/files/css
RUN minify -o icon.css icon.css
RUN minify -o bambou.css bambou.css
WORKDIR /bambou/files/javascripts
RUN minify -o bambou.js bambou.js

FROM python:3.8-alpine

RUN apk add build-base

RUN mkdir /data
VOLUME /data

RUN mkdir /bambou
COPY . /bambou/
RUN rm -rf /bambou/files
COPY --from=builder /bambou/files /bambou/files
RUN rm -rf /bambou/entrypoint.sh

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN pip install -r /bambou/REQUIREMENTS.txt

ENV bambou_PORT 5000
ENV bambou_DEBUG false
ENV bambou_HOST 0.0.0.0
ENV bambou_DIR /data

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bambou"]