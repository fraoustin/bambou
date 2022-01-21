from nodes import Node, DictNodes, Runtime

__version__ = "0.5.1"


def strtolist(tolist):
    return [elt.strip() for elt in tolist.split(',')]


class RuntimeTransform(Runtime):
    def __init__(self, id, idrun, name, log, steps=[]):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        self.steps = steps

    def run(self, in1):
        for step in self.steps:
            self.debug("run step %s : %s " % (step["action"], step["param1"]))
            if step["action"] == 'rename':
                if step["param1"] in in1.index.names:
                    in1 = in1.rename_axis(index={step["param1"]: step["param2"]})
                else:
                    in1 = in1.rename(columns={step["param1"]: step["param2"], })
            if step["action"] == 'dropcol':
                if step["param1"] in in1.index.names:
                    in1 = in1.reset_index(level=step["param1"]) 
                in1 = in1.drop(columns=strtolist(step["param1"]))
            if step["action"] == 'sort':
                ascending = True if step["sort"] == "ascending" else False
                in1 = in1.sort_values(by=strtolist(step["param1"]), ascending=ascending)
            if step["action"] == 'query':
                query = step["param1"].replace(" is null", ".isnull()").replace(" is not null", ".isnull() == False")
                in1.query(query, inplace=True)
            if step["action"] == 'type':
                in1 = in1.astype({step["param1"]: step["param2"], })
            if step["action"] == 'pivot':
                in1 = in1.pivot(index=step["param1"], columns=strtolist(step["param2"]), values=strtolist(step["param3"]))
            if step["action"] == 'limit':
                in1 = in1[:int(step["param1"])-1]
            if step["action"] == 'addcol':
                in1[step["param1"]] = in1.eval(step["param2"])
        return in1


class Transform(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['transform'] = RuntimeTransform
