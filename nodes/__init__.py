import os
import time
import uuid
import random
import string
from flask import Blueprint
from static import Static
import json
import logging
import traceback
import threading
import pandas
from jinja2 import Environment, select_autoescape


def get_random_string(length):
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str


def withjinja(text, string='{'):
    getstring = {'<': {'block_start_string': '<%',
                    'block_end_string': '%>',
                    'variable_start_string': '<<',
                    'variable_end_string': '>>',
                    'comment_start_string': '<#',
                    'comment_end_string': '#>'},
                '{': {'block_start_string': '{%',
                    'block_end_string': '%}',
                    'variable_start_string': '{{',
                    'variable_end_string': '}}',
                    'comment_start_string': '{#',
                    'comment_end_string': '#}'}}
    template = Environment(extensions=['jinja2_time.TimeExtension'], block_start_string=getstring[string]["block_start_string"],
                        block_end_string=getstring[string]["block_end_string"],
                        variable_start_string=getstring[string]["variable_start_string"],
                        variable_end_string=getstring[string]["variable_end_string"],
                        comment_start_string=getstring[string]["comment_start_string"],
                        comment_end_string=getstring[string]["comment_end_string"],
                        autoescape=select_autoescape()).from_string(text)
    return template


class ThreadAttr(threading.Thread):
    def __init__(self, runtime, obj, attr, value):
        threading.Thread.__init__(self)
        self.daemon = True
        self.runtime = runtime
        self.obj = obj
        self.attr = attr
        self.value = value

    def run(self):
        try:
            setattr(self.obj, self.attr, self.value)
        except Exception as err:
            self.runtime._exception(err)


class ThreadStart(threading.Thread):
    def __init__(self, obj, attr, value):
        threading.Thread.__init__(self)
        self.daemon = True
        self.obj = obj
        self.attr = attr
        self.value = value

    def run(self):
        try:
            setattr(self.obj, self.attr, self.value)
        except Exception as err:
            self.obj.critical(err)
            self.obj.critical(traceback.format_exc())


class Node(Blueprint):
    def __init__(self, name="", path="", import_name=__name__, *args, **kwargs):
        if len(name) == 0:
            self._nodename = self.__class__.__name__.lower()
        else:
            self._nodename = name
        Blueprint.__init__(self, self._nodename, import_name=__name__, *args, **kwargs)

    def register(self, app, options):
        try:
            Blueprint.register(self, app, options)
            path = os.path.join(os.path.dirname(os.path.abspath(__file__)), self._nodename, 'files')
            app.register_blueprint(Static(name="%sstatic" % self._nodename, url_prefix="/%s/" % self._nodename, path=path))
        except Exception:
            app.logger.error("init node %s on register is failed" % self._nodename)


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class DictNodes(dict, metaclass=Singleton):
    pass


class DictRun(dict, metaclass=Singleton):
    pass


class Runtime(object):

    def __init__(self, id, idrun, name, input, log, **kw):
        self.id = id
        self.idrun = idrun
        self.name = name
        self.input = input
        self._next = []
        self._previous = []
        self._previousall = []
        self._error = []
        self._log = log
        self.context = kw
        self._tmpin1 = []

    def addNext(self, obj, input):
        if [obj, input] not in self._next:
            self._next.append([obj, input])

    def addError(self, obj, input):
        if [obj, input] not in self._error:
            self._error.append([obj, input])

    def addPrevious(self, obj):
        if obj not in self._previous:
            self._previous.append(obj)

    def addPreviousAll(self, obj):
        if obj not in self._previousall:
            self._previousall.append(obj)

    def __setattr__(self, name, value):
        if name in getattr(self, 'input', []):
            object.__setattr__(self, name, value)
            try:
                self.input.remove(name)
            except Exception:
                pass
            if len(self.input) == 0:
                self._run(self.in1)
            if len(self._tmpin1) > 0:
                for in1 in self._tmpin1:
                    self._run(in1)
                self._tmpin1 = []
        elif name == 'in1':
            if len(self.input) == 0:
                self._run(value)
            else:
                self._tmpin1.append(value)
        else:
            object.__setattr__(self, name, value)

    def _run(self, in1):
        try:
            self.debug('start')
            start = time.time()
            df = self.run(in1)
            end = time.time()
            self.info('end with duration %s' % time.strftime('%M:%S', time.gmtime(end-start)))
            if len(self._next) == 0:
                self.info('end flow')
            if DictRun()[self.idrun]["state"] is True:
                for [runtime, input] in self._next:
                    ThreadAttr(self, runtime, input, df).start()
            else:
                self.warning("flow is stopped")
        except Exception as err:
            self.critical("Critical Error")
            self._exception(err)

    def _exception(self, err):
        if len(self._error) > 0:
            for [runtime, input] in self._error:
                dferror = pandas.DataFrame({'error': [str(err), traceback.format_exc()]}, index=['err', 'trace'])
                ThreadAttr(self, runtime, input, dferror).start()
            self._error = []
        else:
            if len(self._previous) > 0:
                for prev in self._previous:
                    prev._exception(err)
            else:
                self.critical(err)
                self.critical(traceback.format_exc())

    def run(self, in1):
        return in1

    def info(self, txt):
        self._log.info('%s - %s ' % (self.name, txt))

    def debug(self, txt):
        self._log.debug('%s - %s ' % (self.name, txt))

    def warning(self, txt):
        self._log.warning('%s - %s ' % (self.name, txt))

    def error(self, txt):
        self._log.error('%s - %s ' % (self.name, txt))

    def critical(self, txt):
        self._log.critical('%s - %s ' % (self.name, txt))


def runMap(data, pathlog, levellog=logging.DEBUG, env="", version="", idrun=None, logger=None, onflow=None, in1=None):
    map = json.loads(data)
    if idrun not in DictRun():
        DictRun()[idrun] = {"state": True, "id": map["flow"]["id"]}
    if len(env) > 0:
        if env in map["env"]:
            sub = map['env'][env]
            sub["_id"] = map["flow"]["id"]
            sub["_name"] = map["flow"]["name"]
            sub["_version"] = version
            sub["_levellog"] = levellog
            map['map'] = json.loads(withjinja(json.dumps(map['map']), string="<").render(**sub))
        else:
            env = ""
    if len(env) == 0:
        map['map'] = json.loads(withjinja(json.dumps(map['map']), string="<").render(**{"_id": map["flow"]["id"], "_name": map["flow"]["name"], "_version": version, "_levellog": levellog}))
    if logger is None:
        my_logger = logging.getLogger('MyLogger' + str(map['flow']['id']) + str(uuid.uuid4()))
        my_logger.setLevel(levellog)
        handler = logging.FileHandler(filename=pathlog)
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        my_logger.addHandler(handler)
    else:
        my_logger = logger
    if onflow is not None:
        my_logger.info("%s (version: %s) start %s" % (str(map['flow']['name']), version, ("with env %s" % env if len(env) > 0 else '')))
    try:
        runtimes = {}
        runtimesLinked = []
        for obj in map['map']:
            runtimes[obj["id"]] = DictNodes()[obj["type"]](obj["id"], idrun, obj["text"], my_logger, **obj["parameters"])
        for obj in map['map']:
            for outputport in obj['outputports']:
                if len(outputport['target']) > 0:
                    for target in outputport['target']:
                        if outputport['name'] != 'error':
                            runtimes[obj["id"]].addNext(runtimes[target["id"]], target['name'])
                            if target["name"] == 'in1':
                                runtimes[target["id"]].addPrevious(runtimes[obj["id"]])
                            runtimes[target["id"]].addPreviousAll(runtimes[obj["id"]])
                        else:
                            runtimes[obj["id"]].addError(runtimes[target["id"]], target['name'])
                        runtimesLinked.append(runtimes[target["id"]])
        if in1 is None:
            in1 = pandas.DataFrame({'null': [None, ]}, index=[0, ])
        for runtime in [runtimes[runtime] for runtime in runtimes]:
            if runtime not in runtimesLinked:
                if onflow is not None:
                    runtime.addPrevious(onflow)
                for input in runtime.input:
                    ThreadStart(runtime, input, in1).start()
    except Exception as err:
        if onflow is None:
            my_logger.critical(err)
            my_logger.critical(traceback.format_exc())
        else:
            onflow._exception(err)
