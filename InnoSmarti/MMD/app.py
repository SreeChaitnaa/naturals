import logging

from flask import Flask, request
from flask_cors import CORS
import requests
from urllib3.util import connection
from MMDHandler import MMDHandler, MMDStatus
from Settings import Settings


app = Flask(__name__)
CORS(app)
redirect_server = "https://naturals2.innosmarti.com/"

_orig_create_connection = connection.create_connection
settings = Settings()
last_auth = None


def patched_create_connection(address, *args, **kwargs):
    """Wrap urllib3's create_connection to resolve the name elsewhere"""
    # resolve hostname to an ip address; use your own
    # resolver here, as otherwise the system resolver will be used.
    host, port = address
    if host == "ntlivewebapi.innosmarti.com":
        host = "3.109.90.139"

    return _orig_create_connection((host, port), *args, **kwargs)


connection.create_connection = patched_create_connection

# Configure Flask logging
app.logger.setLevel(logging.DEBUG)  # Set log level to INFO
handler = logging.FileHandler('app.log')  # Log to a file
handler.setLevel(logging.WARNING)
app.logger.addHandler(handler)
session = requests.session()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"])
def mmd(path):
    global last_auth
    mmd_handler = MMDHandler(request, settings, app.logger)

    if mmd_handler.pre_resp_code == MMDStatus.NoServerCall:
        return mmd_handler.pre_resp
    headers = request.headers
    if "Authorization" in headers:
        if headers["Authorization"] == "UseLast":
            headers = dict(headers)
            headers["Authorization"] = last_auth
        else:
            last_auth = headers["Authorization"]
        app.logger.info("Headers - {}".format(headers))

    resp = session.request(request.method, request.url, data=request.data,
                           headers=headers).text

    return mmd_handler.post_handler(resp, headers)


if __name__ == '__main__':
    # context = ('C:\\Users\\NXT\\Documents\\server.crt', 'C:\\Users\\NXT\\Documents\\server.key')
    # app.run(port=443, ssl_context=context, debug=True)
    app.run()
