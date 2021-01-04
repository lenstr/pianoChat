FROM python:3.9-alpine

RUN pip install websockets

WORKDIR /app
COPY server.py /app

CMD [ "python", "-u", "server.py" ]