FROM python:3.8-slim
LABEL maintainer="Frederic Aoustin <fraoustin@gmail.com>"

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

RUN mkdir /bambou
COPY . /bambou/
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