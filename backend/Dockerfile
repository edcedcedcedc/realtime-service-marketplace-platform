FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./ /app/

RUN pip3 install --upgrade pip
RUN pip3 install -r requirements_asgi_server.txt

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]

