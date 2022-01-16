from nodes import DictNodes, Runtime, withjinja
from nodesextra import NodeExtra

__version__ = "0.1.1"


class RuntimeSample(Runtime):
    def __init__(self, id, idrun, name, log, text=""):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        self.text = text

    def run(self, in1):
        self.text = withjinja(self.text).render({"in1": in1})
        self.info(self.text)


class Sample(NodeExtra):
    def __init__(self, *args, **kw):
        NodeExtra.__init__(self, *args, **kw)
        DictNodes()['sample'] = RuntimeSample
