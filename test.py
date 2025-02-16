from flask import Flask
from flask import render_template

app = Flask(__name__)

# Root directory
@app.route('/')
def hello_world():
    return render_template('index-with-popup.html', message="PENIS AND BALLS AND SHAFT")

if __name__ == '__main__':
    app.run(ssl_context='adhoc')
