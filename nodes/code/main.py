from nodes import Node, DictNodes, Runtime, withjinja
from pandas import DataFrame

__version__ = "0.2.1"


class RuntimeCode(Runtime):
    def __init__(self, id, idrun, name, log, code=""):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        self.code = code

    def run(self, in1):
        out = DataFrame()
        self.debug("exec code")
        exec(withjinja(self.code).render({"in1": self.in1}))
        return out


class Code(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['code'] = RuntimeCode
