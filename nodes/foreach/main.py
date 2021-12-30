from nodes import Node, DictNodes, Runtime, ThreadAttr

__version__ = "0.1.1"


class RuntimeForeach(Runtime):
    def __init__(self, id, idrun, name, log, groupbys):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        self.groupbys = groupbys

    def run(self, in1):
        groupby = in1.groupby([groupby.strip() for groupby in self.groupbys])
        querys = []
        for filt in groupby.groups.keys():
            if isinstance(filt, str) is True:
                filt = [filt, ]
            querys.append(" and ".join(["%s == '%s'" % (groupby, value) for groupby, value in zip(self.groupbys, filt)]))
        for query in querys[:-1]:
            try:
                for [runtime, input] in self._next:
                    ThreadAttr(self, runtime, input, in1.query(query)).start()
            except Exception as err:
                self._exception(err)
        return in1.query(querys[-1])


class Foreach(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['foreach'] = RuntimeForeach
