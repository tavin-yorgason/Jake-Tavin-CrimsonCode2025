from flask import Flask, render_template

app = Flask(__name__)

# Root directory
@app.route('/')
def index():
    return render_template('index-with-popup.html')

# Route for sensors page
@app.route('/sensors')
def sensors():
    return render_template('sensors.html')

if __name__ == '__main__':
    app.run(ssl_context='adhoc')
