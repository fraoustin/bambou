from nodes import Node, DictNodes, Runtime, withjinja, runMap
from logging import DEBUG, INFO, WARNING, ERROR, CRITICAL
from flask_login import login_required
from flask import current_app
from db.models import Flow
from sqlalchemy import create_engine
import json

__version__ = "0.0.1"

SQLALCHEMY_DATABASE_URI = ""


@login_required
def flows():
    return {"flows": [{"id": flow.id, "name": flow.name} for flow in Flow.query.all()]}


class RuntimeSubflow(Runtime):
    def __init__(self, id, idrun, name, log, **kw):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        for key in kw:
            self.__setattr__(key, kw[key])
        LEVEL_LOG = {'inherited': self._log.level,
                    'debug': DEBUG,
                    'info': INFO,
                    'warning': WARNING,
                    'error': ERROR,
                    'critical': CRITICAL}
        self.level = LEVEL_LOG[self.level]
        self.flow = int(self.flow)

    def run(self, in1):
        env = withjinja(self.env).render({"in1": in1}).strip()
        version = withjinja(self.version).render({"in1": in1}).strip()
        global SQLALCHEMY_DATABASE_URI
        engine = create_engine(SQLALCHEMY_DATABASE_URI)
        if len(version) == 0:
            query = "select map from flow where id = %s" % self.flow
        else:
            query = "select map from flowversion where idflow = %s and version = '%s'" % (self.flow, version)
        with engine.connect() as connection:
            result = connection.execute(query)
            for row in result:
                data = row[0]
        map = json.loads(data)
        for elt in self.newenvs:
            if len(env) == 0:
                env = "subflow"
            map['env'][env][withjinja(elt["name"]).render({"in1": in1}).strip()] = withjinja(elt["value"]).render({"in1": in1}).strip()
        runMap(json.dumps(map), "", levellog=self.level, env=env, version=version, idrun=self.idrun, logger=self._log, onflow=self, in1=in1)
        return in1


class Subflow(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        self.before_app_first_request(self._init)
        DictNodes()['subflow'] = RuntimeSubflow
        self.add_url_rule('/flows', 'flows', flows, methods=['GET'])

    def _init(self):
        global SQLALCHEMY_DATABASE_URI
        SQLALCHEMY_DATABASE_URI = current_app.config["SQLALCHEMY_DATABASE_URI"]
