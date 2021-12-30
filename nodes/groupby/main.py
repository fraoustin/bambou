from nodes import Node, DictNodes, Runtime

__version__ = "0.1.0"


class RuntimeGroupby(Runtime):
    def __init__(self, id, idrun, name, log, groupbys, aggs):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        self.groupbys = groupbys
        self.aggs = aggs

    def run(self, in1):
        in1 = in1.groupby([groupby.strip() for groupby in self.groupbys]).agg(**{"%s(%s)" % (agg['mode'], agg['col']): (agg['col'], agg['mode']) for agg in self.aggs})
        return in1


class Groupby(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['groupby'] = RuntimeGroupby
