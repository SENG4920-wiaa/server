# server

* Music endpoint: `/music/?keyword=<keyword>`
* Sound effects endpoint: `/effects/?keyword=<keyword>`
* Word frequency endpoint: `/freq/?keyword=<keyword>`
* ML Labels endpoint: PUT `/labels/<filename>` with video in request body
* ML Transcript endpoint: PUT `/transcript/<filename>` with video in request body

## Backend Installation

* `pip install -r requirements.txt`

## Changing the backend `requirements.txt`

* `pip freeze > requirements.txt`

## Google Cloud Authentication

1. Download the service account JSON file

2. Set the path as the `GOOGLE_APPLICATION_CREDENTIALS` environment variable in your terminal: https://cloud.google.com/docs/authentication/production#passing_variable

    export GOOGLE_APPLICATION_CREDENTIALS="./auth.json"
