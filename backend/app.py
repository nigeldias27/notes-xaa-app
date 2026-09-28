import os
import json
from flask import Flask, jsonify, abort, make_response, request, render_template, redirect, send_from_directory
from functools import wraps
import json
import uuid
import time
import requests
from flask_cors import CORS
import jwt

app = Flask(
    __name__, 
    static_folder=os.path.abspath('../frontend/build'), 
    template_folder=os.path.abspath('../frontend/build')
)

CORS(app)
user_file_path = "user.json"
BASE_URL = os.environ.get('BASE_URL', "http://127.0.0.1:5000")

# Check if the file user_file_path exists
if not os.path.exists(user_file_path):
    # Create the file and initialize it with an empty dictionary
    with open(user_file_path, "w") as f:
        json.dump({}, f)
    print(f"Created {user_file_path}")
else:
    print(f"{user_file_path} already exists")


@app.route('/api/setNotes', methods = ['POST'])
def setNotes():
    data = request.get_json()
    users = readFile(user_file_path)
    if (data.get('user') in users):
        users[data.get('user')]['notes'] = data.get('notes')
    else:
        userObj = emptyUserObj(data.get('user'))
        userObj['notes'] = data.get('notes')
        users[data.get('user')] = userObj
    updateFile(user_file_path, users)
    return jsonify(users[data.get('user')])

@app.route('/api/getNotes', methods = ['GET'])
def getNotes():
    user = request.args.get("user")
    return jsonify(readFile(user_file_path)[user]['notes'])

@app.route('/api/getApps', methods = ['GET'])
def getApps():
    user = request.args.get("user")
    return jsonify(readFile(user_file_path)[user]['apps'])

@app.route('/api/addApp', methods = ['GET'])
def addApp():
    data = request.get_json()
    users = readFile(user_file_path)
    app = {
        "appName": data.appName,
        "clientId":data.appNam+"clientId",
        "clientSecret":data.appNam+"clientSecret"
    }
    users[data.get('user')]['apps'] = users[data.get('user')]['apps'] + [app]
    updateFile(user_file_path, users)
    return jsonify(users[data.get('user')]['apps'])

@app.route('/api/setAuthSettings', methods = ['POST'])
def setAuthSettings():
    data = request.get_json()
    users = readFile(user_file_path)
    if (data.get('user') in users):
        users[data.get('user')]['domain'] = data.get('domain')
        users[data.get('user')]['clientId'] = data.get('clientId')
        users[data.get('user')]['clientSecret'] = data.get('clientSecret')
    else:
        userObj = emptyUserObj(data.get('user'))
        userObj['domain'] = data.get('domain')
        userObj['clientId'] = data.get('clientId')
        userObj['clientSecret'] = data.get('clientSecret')
        users[data.get('user')] = userObj
    updateFile(user_file_path, users)
    return jsonify(users[data.get('user')])

@app.route('/api/getAuthSettings', methods = ['GET'])
def getAuthSettings():
    user = request.args.get("user")
    users = readFile(user_file_path)
    userObj = users[user]
    userObj['state'] = uuid.uuid4()
    users[user] = userObj
    updateFile(user_file_path, users)
    return jsonify({
        'domain':userObj['domain'],
        'clientId':userObj['clientId'],
        'clientSecret':userObj['clientSecret'],
        'state':userObj['state']
    })

@app.route('/api/createUser', methods = ['POST'])
def createUser():
    data = request.get_json()
    users = readFile(user_file_path)
    users[data.get('user')] = emptyUserObj(data.get('user'))
    users[data.get('user')]['password'] = data.get('password')
    updateFile(user_file_path, users)
    return jsonify(users[data.get('user')]), 200

@app.route('/resource/callback', methods = ['GET'])
def callback():
    code = request.args.get("code")
    state = request.args.get("state")
    users = readFile(user_file_path)
    for email, user in users.items():
        if user['state'] == state:
            token = requests.post("https://"+user["domain"]+"/oauth2/v1/token",
                                  data={"grant_type":"authorization_code","redirect_uri":BASE_URL+"/resource/callback","code":code},
                                  headers={"accept":"application/json","content-type":"application/x-www-form-urlencoded"},
                                  auth=(user['clientId'],user['clientSecret']))
            user["accessToken"] = token.json()["access_token"]
            decoded_payload = jwt.decode(user["accessToken"], options={"verify_signature": False})
            user["sub"] = decoded_payload["sub"]
            users[email] = user
            updateFile(user_file_path, users)
            return redirect('/home')

@app.route('/resource/issuer', methods = ['GET'])
def exchangeIdJag():
    idJag = request.form.get('assertion')
    decoded_payload = jwt.decode(idJag, options={"verify_signature": False})
    users = readFile(user_file_path)
    for user in users.values():
        if user['sub'] == decoded_payload['sub']:
            return jsonify({
     "token_type": "Bearer",
     "access_token": uuid.uuid4(),
     "expires_in": 86400,
   })

@app.route('/api/notes', methods = ['GET'])
def getProtectedNotes():
    users = readFile(user_file_path)
    for user in users.values():
        if user['accessToken'] == request.headers["Authorization"].split("Bearer ")[1]:
            return jsonify(user['notes'])

# 1. Your Backend API Routes
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({
        "message": "Hello from the integrated Flask backend!",
        "items": ["Python", "Flask", "React", "Single-Server"]
    })

# 2. Serve Static Assets (JS, CSS, Images)
@app.route('/<path:path>')
def serve_static(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# 3. Catch-All Route for Frontend (Crucial for React Router client-side routing)
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

def readFile(fileName):
    with open(fileName, "r", encoding="utf-8") as file:
        data = json.load(file)
        return data
def updateFile(fileName, data):
    with open(fileName, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)
def emptyUserObj(user):
    return {"user": user, "clientId":"", "clientSecret":"","domain":"","notes":[],"apps":[],"password":"","accessToken":"","state":"","sub":""}
if __name__ == "__main__":
    app.run(debug=True, port=5000)
