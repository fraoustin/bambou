from nodes import Node, DictNodes, Runtime
from pandas import concat
import json

__version__ = "0.1.2"


class RuntimeLink(Runtime):
    def __init__(self, id, idrun, name, log, **kw):
        Runtime.__init__(self, id, idrun, name, ['in1', 'in2'], log)
        for key in kw:
            self.__setattr__(key, kw[key].strip())

    def run(self, in1):
        if self.type == "concat":
            return concat([in1, self.in2], axis=int(self.axis), join=self.join)
        if self.type == "join":
            return in1.merge(self.in2,
                            how=self.how,
                            left_on=self.left_on.split(','),
                            right_on=self.right_on.split(','),
                            suffixes=(self.left_suffix, self.right_suffix),
                            indicator=json.loads(self.indicator.lower()),
                            validate=self.validate)
        return in1


class Link(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['link'] = RuntimeLink
