from flask import Flask, render_template

app = Flask(__name__)

# Root directory
@app.route('/')
def index():
    return render_template('index.html')

# Route for sensors page
@app.route('/sensors')
def sensors():
    return render_template('sensors.html')

# Route for about page
@app.route('/about')
def about():
    return render_template('about.html')

# Route for vidoe page
@app.route('/video')
def video():
    return render_template('video.html')

if __name__ == '__main__':
    app.run(ssl_context='adhoc')
