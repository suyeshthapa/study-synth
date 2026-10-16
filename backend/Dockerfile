# lightweight python base image
FROM python:3.11-slim

# avoid writing .pyc files
ENV PYTHONDONTWRITEBYTECODE 1
# python output is not buffered
ENV PYTHONUNBUFFERED 1

# set working dir inside image
WORKDIR /app

# update linux package list and install postgresql dev libs, c compiler, etc.
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*
# delete list to reduce image size

# copy text file into image
COPY requirements.txt .
# install python dependencies listed in text file without pip's download cache
RUN pip install --no-cache-dir -r requirements.txt

# copy everything into image
COPY . .

# make entrypoint executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# command to run on container start
ENTRYPOINT ["./entrypoint.sh"]