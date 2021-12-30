FROM debian as builder
LABEL maintainer="Frederic Aoustin <fraoustin@gmail.com>"

RUN apt-get update && apt-get install -y \
        minify \
    && rm -rf /var/lib/apt/lists/* 

RUN mkdir /flow
RUN mkdir /flow/files
COPY ./files/ /flow/files/
WORKDIR /flow/files/css
RUN minify -o icon.css icon.css
RUN minify -o flow.css flow.css
WORKDIR /flow/files/javascripts
RUN minify -o flow.js flow.js

FROM python:3.8-alpine

RUN apk add build-base

RUN mkdir /data
VOLUME /data

RUN mkdir /flow
COPY . /flow/
RUN rm -rf /flow/files
COPY --from=builder /flow/files /flow/files
RUN rm -rf /flow/entrypoint.sh

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN pip install -r /flow/REQUIREMENTS.txt

ENV FLOW_PORT 5000
ENV FLOW_DEBUG false
ENV FLOW_HOST 0.0.0.0
ENV FLOW_DIR /data

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["flow"]