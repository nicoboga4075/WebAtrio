import logging
from flask import Flask, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# Initialization of Flask
app = Flask(__name__)
app.config.from_object('config')

CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

# Configure Flask logging : info, debug, warning, error or critical
app.logger.setLevel(logging.INFO)  # Set log level to INFO
handler = logging.FileHandler('WebAtrio.log')  # Log to a file
app.logger.addHandler(handler)

# Connection between Flask and SQLAlchemy
db = SQLAlchemy(app)

