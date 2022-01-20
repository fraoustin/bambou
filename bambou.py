import os
import logging
import importlib
import configparser
from flask import Flask, render_template

from db import db
from auth import Auth, login_required
from info import Info
from static import Static
from paramapplication import ParamApplication
from core import Core

BAMBOU_LOGO = """
       ##
      ####    ##
      ###########
  #####        ##
 #   #          #
#   ##          #
#   #   ##      #
#   #  ###  ##  #
#   #  ##   ##  #
##  ##       #  #
##  ###  ###   ##
 ## ####  #   ###
 ########   #####
 ################
  ### ####   ###
   ## ####  ####
       #### ###
        ###
"""

toBoolean = {'true': True, 'false': False}

BAMBOU_DIR = os.environ.get('BAMBOU_DIR', os.path.dirname(os.path.abspath(__file__)))
config = configparser.ConfigParser()
config.read(os.path.join(BAMBOU_DIR, 'bambou.cfg'))
if 'BAMBOU' not in config.keys():
    config['BAMBOU'] = {}
BAMBOU_PORT = int(os.environ.get('BAMBOU_PORT', config['BAMBOU'].get('Port', '5000')))
BAMBOU_DEBUG = toBoolean.get(os.environ.get('BAMBOU_DEBUG', config['BAMBOU'].get('Debug', 'false')), False)
BAMBOU_HOST = os.environ.get('BAMBOU_HOST', config['BAMBOU'].get('Host', '0.0.0.0'))
BAMBOU_LOGS = os.environ.get('BAMBOU_LOGS', config['BAMBOU'].get('Log', os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")))

app = Flask(__name__)
app.config["VERSION"] = "0.9.0"

app.config["APP_PORT"] = BAMBOU_PORT
app.config["APP_HOST"] = BAMBOU_HOST
app.config["APP_DEBUG"] = BAMBOU_DEBUG
app.config["APP_DIR"] = BAMBOU_DIR
app.config["APP_LOGS"] = BAMBOU_LOGS

# db SQLAlchemy
database_file = "sqlite:///{}".format(os.path.join(BAMBOU_DIR, "bambou.db"))
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get('BAMBOU_DB', config['BAMBOU'].get('Db', database_file))
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# register Auth
app.register_blueprint(Auth(url_prefix="/"))
app.config['APP_NAME'] = os.environ.get('BAMBOU_NAME', 'Bambou')
app.config['APP_DESC'] = os.environ.get('BAMBOU_DESC', 'ETL with Pandas')
# register Info
app.register_blueprint(Info(url_prefix="/"))
# register Static
BAMBOU_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'files')
app.register_blueprint(Static(name="js", url_prefix="/javascripts/", path=os.path.join(BAMBOU_PATH, "javascripts")))
app.register_blueprint(Static(name="siimple", url_prefix="/siimple/", path=os.path.join(BAMBOU_PATH, "siimple")))
app.register_blueprint(Static(name="css", url_prefix="/css/", path=os.path.join(BAMBOU_PATH, "css")))
app.register_blueprint(Static(name="img", url_prefix="/img/", path=os.path.join(BAMBOU_PATH, "img")))
app.register_blueprint(Static(name="codemirror", url_prefix="/codemirror/", path=os.path.join(BAMBOU_PATH, "codemirror")))
# register ParamApplication
app.register_blueprint(ParamApplication(url_prefix="/"))

# register BAMBOU
app.register_blueprint(Core(url_prefix="/"))
app.config['NODES'] = []
NODES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nodes')
for node in [node for node in os.listdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nodes')) if os.path.isdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nodes', node)) and '_' not in node]:
    app.config['NODES'].append(node)
    module = importlib.import_module('nodes.%s.main' % node)
    app.register_blueprint(getattr(module, node.capitalize())(name=node, url_prefix="/"))

for node in [node for node in os.listdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nodesextra')) if os.path.isdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nodesextra', node)) and '_' not in node and node != 'sample']:
    app.config['NODES'].append(node)
    module = importlib.import_module('nodesextra.%s.main' % node)
    app.register_blueprint(getattr(module, node.capitalize())(name=node, url_prefix="/"))


@app.route("/", methods=["GET", "POST"])
@login_required
def home():
    return render_template('index.html')


if __name__ == "__main__":
    print(BAMBOU_LOGO)
    print("BAMBOU v%s" % app.config["VERSION"])
    db.init_app(app)
    with app.app_context():
        db.create_all()
    with app.app_context():
        for bp in app.blueprints:
            if 'init_db' in dir(app.blueprints[bp]):
                app.blueprints[bp].init_db()
    app.logger.setLevel(logging.DEBUG)
    app.run(host=BAMBOU_HOST, port=BAMBOU_PORT, debug=BAMBOU_DEBUG)
