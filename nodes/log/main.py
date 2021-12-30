from nodes import Node, DictNodes, Runtime, withjinja
import logging
try:
    import syslog
    SYSLOG = True
except Exception:
    SYSLOG = False
import graypy

__version__ = "0.1.1"


class RuntimeLog(Runtime):
    def __init__(self, id, idrun, name, log, text="", level="info", dest="", graylogip="", graylogport=""):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        LEVEL_LOG = {'debug': self.debug,
                    'info': self.info,
                    'warning': self.warning,
                    'error': self.error,
                    'critical': self.critical}
        self.text = text
        self.level = LEVEL_LOG[level]
        self.dest = dest
        self.graylopip = graylogip
        self.graylogport = graylogport
        if SYSLOG is True:
            LEVEL_SYSLOG = {'debug': syslog.LOG_DEBUG,
                        'info': syslog.LOG_INFO,
                        'warning': syslog.LOG_WARNING,
                        'error': syslog.LOG_ERR,
                        'critical': syslog.LOG_CRIT}
            self.syslog = LEVEL_SYSLOG[level]

    def run(self, in1):
        self.text = withjinja(self.text).render({"in1": in1})
        if self.dest == "log":
            self.level(self.text)
        if self.dest == "syslog":
            if SYSLOG is True:
                syslog.syslog(self.syslog, self.text)
            else:
                self.info(self.text)
        if self.dest == "graylog":
            my_logger = logging.getLogger(self.id)
            my_logger.setLevel(logging.DEBUG)
            handler = graypy.GELFUDPHandler(self.graylopip, int(self.graylogport))
            my_logger.addHandler(handler)
            my_logger.debug(self.text)
        return in1


class Log(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['log'] = RuntimeLog
