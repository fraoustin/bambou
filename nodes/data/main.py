import os
import sqlite3
import json
from nodes import Node, DictNodes, Runtime
from flask import current_app
from flask_login import login_required
from sqlalchemy import create_engine

from core import checkAuthorizationFlow

__version__ = "0.1.4"


class SuperRuntimeData(object):

    def __init__(self, pathlog):
        self.pathlog = pathlog

    def __call__(self, *args, **kwargs):
        return RuntimeData(self.pathlog, *args, **kwargs)


class RuntimeData(Runtime):
    def __init__(self, pathlog, id, idrun, name, log, **kw):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        self.pathlog = pathlog
        for key in kw:
            self.__setattr__(key, kw[key].strip())
        if self.dropindex == 'true':
            self.dropindex = False
        else:
            self.dropindex = True

    def run(self, in1):
        path = os.path.join(self.pathlog, str(self.idflow), "%s.db" % self.uid)
        if os.path.exists(path):
            os.remove(path)
        cnx = create_engine('sqlite:///%s' % path)
        if len(self.limit) > 0:
            data = in1[:int(self.limit)]
        else:
            data = in1
        data.to_sql(name='data', con=cnx, index=self.dropindex)
        return in1


@login_required
@checkAuthorizationFlow()
def data(id, uid):
    try:
        conn = sqlite3.connect(os.path.join(current_app.config["APP_LOGS"], str(id), "%s.db" % uid))
        cur = conn.cursor()
        cur.execute("SELECT * FROM data")
        rows = cur.fetchall()
        if len(rows) == 0:
            rows = ["null" for description in cur.description]
        return json.dumps({"header": [description[0] for description in cur.description], "rows": rows})
    except Exception:
        return json.dumps({"header": ["col1", ], "rows": ["nodata", ]})


@login_required
@checkAuthorizationFlow()
def delete_data(id, uid):
    path = os.path.join(current_app.config["APP_LOGS"], str(id), "%s.db" % uid)
    if os.path.exists(path):
        os.remove(path)
    return {"status": "ok"}, 200


class Data(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        self.before_app_first_request(self._init)
        self.add_url_rule('/flow/<int:id>/data/<string:uid>', 'data', data, methods=['GET'])
        self.add_url_rule('/flow/<int:id>/data/<string:uid>/del', 'delete_data', delete_data, methods=['GET'])

    def _init(self):
        DictNodes()['data'] = SuperRuntimeData(current_app.config["APP_LOGS"])
