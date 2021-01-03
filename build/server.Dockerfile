FROM python:3.9-alpine

RUN pip install websockets

COPY . /app
WORKDIR /app
CMD [ "python", "-u", "server.py" ]