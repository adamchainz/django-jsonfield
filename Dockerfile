FROM 353605023268.dkr.ecr.us-east-1.amazonaws.com/python_tox:latest

WORKDIR /src/

COPY . .

CMD tox
