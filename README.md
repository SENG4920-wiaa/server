# server

* Music endpoint: GET `/music/?keyword=<keyword>`
* Sound effects endpoint: GET `/effects/?keyword=<keyword>`
* Word frequency endpoint: GET `/freq/?keyword=<keyword>`
* ML Labels endpoint: PUT `/labels/<filename>` with video in request body
* ML Transcript endpoint: PUT `/transcript/<filename>` with video in request body
* Upload: POST `/upload/` with video in request body
* Compile: GET `/compiled/<filename>` with JSON in request body sample JSON below
```
{
    "music": {
        "url": "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/The_Undynamic_Pop_Experiment/Live_at_St_Marys_College_of_Maryland/The_Undynamic_Pop_Experiment_-_06_-_Newport_Jazz.mp3",
        "start": 30,
        "volume": 0.3
    },
    "effects": [
        {
            "url": "https://freesound.org/data/previews/402/402628_5121236-lq.mp3",
            "start": 3,
            "volume": 1
        },
        {
            "url": "https://freesound.org/data/previews/242/242004_1900515-lq.mp3",
            "start": 5,
            "volume": 1
        }
    ]
}
```

## Google Cloud Authentication

1. Download the service account JSON file
2. Set the path as the `GOOGLE_APPLICATION_CREDENTIALS` environment variable in your terminal: https://cloud.google.com/docs/authentication/production#passing_variable
    * `export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/my-key.json"`
    * `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\username\Downloads\my-key.json"` in PowerShell
    * `set GOOGLE_APPLICATION_CREDENTIALS="C:\Users\username\Downloads\my-key.json"` in Command Prompt

## Backend Installation

* Python 3 Should be installed
* `cd server/backend`
* `python3 -m venv env` to initialise a python virtual environment
* `source env/bin/activate` or `env\Scripts\activate` on Windows to activate the virtual environment
* `pip install -r requirements.txt` to install the required dependencies

## Starting the backend

* `source env/bin/activate` or `env\Scripts\activate` on Windows to activate the virtual environment
* `python manage.py runserver` to run the server
* Link to server home is printed, can open in browser

## Changing the backend `requirements.txt`
* `pip freeze > requirements.txt`

# Frontend
* The Front-End consists of frontend-UI/app, the Javascript React Single-Page Application, and frontend-UI/server, the Python Flask server.
* The Python Flask server's only responsibliity is as a dumb file hoster, sending the right CORS headers.
* We use `yarn` for package management within frontend-UI/app
* frontend/ is not used
* We use a virtual environment for flask, but that is optional.

## Starting
Install yarn package manager from your system package manager

    cd frontend-UI/app/
    yarn install
    yarn build

In another terminal:

    cd frontend-UI/server
    virtualenv venv
    . venv/bin/activate
    pip3 install -r requirements.txt
    python3 app.py
