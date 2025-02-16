# README
This is our submission for the Crimson Code 2025 Hackathon!

## Overview
This is a small web app / game where the user can "roll" around a ball on the screen! It uses several features of the phone to change the experience. These include:
1) Gyroscope information to control the movement of the ball
2) A sample from your camera to control the color of the ball
3) The volume from the microphone to control the size of the ball
4) A screen / mouse to teleport the ball to a given position

Unfortunately, due to Apple's Appleness, the camera functionality does not work on iOS. The rest of it does though. It has also not been tested on macOS.

## Installation
1) Clone the repo
2) Run the python either with
    1) The built in run file
    2) With the flask command - just ensure that it is given an https cert and that the flask server can be accessed from other computers on the network
3) Connect to the URL given by flask, either on the local computer or on a networked computer
4) Enjoy the widget! Use the menu to access some other pages as well as to control the roller ball simulation.