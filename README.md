# server

* Music endpoint: `/music/?keyword=<keyword>`
* Sound effects endpoint: `/effects/?keyword=<keyword>`
* Word frequency endpoint: `/freq/?keyword=<keyword>`
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

## Backend Installation

* `pip install -r requirements.txt`

## Changing the backend `requirements.txt`

* `pip freeze > requirements.txt`

## Google Cloud Authentication

1. Download the service account JSON file

2. Set the path as the `GOOGLE_APPLICATION_CREDENTIALS` environment variable in your terminal: https://cloud.google.com/docs/authentication/production#passing_variable
