from nodes import Node, DictNodes, Runtime

__version__ = "0.1.1"


class RuntimeSynchro(Runtime):
    def __init__(self, id, idrun, name, log):
        Runtime.__init__(self, id, idrun, name, ['in1', 'in2'], log)
        self._inputsin2 = 0

    def __setattr__(self, name, value):
        if name in getattr(self, 'input', []) or name == "in2":
            if name == "in1":
                object.__setattr__(self, name, value)
            if name == "in2":
                self._inputsin2 = self._inputsin2 + 1
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
        self.info("_run %s : %s" % (self._inputsin2, len(self._previousall)-1))
        if self._inputsin2 >= len(self._previousall)-1:
            Runtime._run(self, in1)

    def run(self, in1):
        return in1


class Synchro(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['synchro'] = RuntimeSynchro
