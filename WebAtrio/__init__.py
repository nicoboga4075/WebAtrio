from .views import app
from . import models

@app.cli.command('init-db')
def init_db():
    models.init_db()
    