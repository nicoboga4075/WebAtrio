import os
from WebAtrio import app  # Imports the code from WebAtrio/__init__.py
from gevent.pywsgi import WSGIServer

def update_config_file(key, value):
    config_path = 'WebAtrioFront/src/assets/config.txt'
    
    # Read the current lines from config.py
    with open(config_path, 'r') as f:
        lines = f.readlines()

    key_exists = False
    new_lines = []

    # Look for the key in the config file
    for line in lines:
        if line.startswith(key):
            # If the key exists, replace the line with the new value
            new_lines.append(f"{key} = {repr(value)}\n")
            key_exists = True
        else:
            new_lines.append(line)

    # If the key does not exist, add it to the end of the file
    if not key_exists:
        new_lines.append(f"{key} = {repr(value)}\n")

    # Write the modified content back to config.py
    with open(config_path, 'w') as f:
        f.writelines(new_lines)

if __name__ == '__main__':
    os.environ['FLASK_ENV'] = app.config['FLASK_ENV']

    HOST = "0.0.0.0"  
    PORT = int(os.environ.get('SERVER_PORT'))
    DEBUG = "0"

    # Enable debug mode if in development
    if os.environ.get('FLASK_ENV') == 'development':
        HOST = "localhost"
        DEBUG = "1"
        app.debug = True
        
    os.environ['FLASK_RUN_HOST'] = HOST
    os.environ['FLASK_RUN_PORT'] = str(PORT)
    os.environ['FLASK_DEBUG'] = DEBUG
    
    # Create and start the WSGI server
    http_server = WSGIServer((HOST, PORT), app)
    print(f"Starting server on http://{HOST}:{PORT}")
    update_config_file('FLASK_DEBUG',DEBUG)
    update_config_file('FLASK_RUN_HOST',HOST)
    update_config_file('FLASK_RUN_PORT',PORT)   
    http_server.serve_forever()