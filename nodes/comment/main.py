from nodes import Node, Runtime, DictNodes

__version__ = "0.0.2"


class RuntimeComment(Runtime):
    def __init__(self, id, idrun, name, log, **kw):
        Runtime.__init__(self, id, idrun, name, [], log)


class Comment(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['comment'] = RuntimeComment
