# Sano Genetics Full-stack engineer task

# Installation

* Install Python 3.8 and Node 12.x.x and  using your favourite installation methods
* Install Postgres. For Mac, we recommend Postgres app: https://postgresapp.com/
* Run a local postgres server, and add the database URL as the value of the `connection_url` key in `local-config.json`
* Within the `server/` directory, seed your local database with example studies by running `source venv/bin/activate; run/seed_db.py`.
* Within the `server/` directory download the server dependencies and run the server locally with `run/server`.
* In a seperate terminal shell, inside the `client/` directory, download the client dependencies and run the client locally with `run/client`.
* Navigate to http://0.0.0.0:2000 in your browser.