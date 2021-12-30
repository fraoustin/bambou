import os
from nodes import Node, DictNodes, Runtime, withjinja
import pysftp

__version__ = "0.1.1"


class RuntimeHtmljinja(Runtime):
    def __init__(self, id, idrun, name, log, **kw):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        for key in kw:
            self.__setattr__(key, kw[key].strip())

    def run(self, in1):
        pathfile = withjinja(self.path).render({"in1": in1})
        templatepath = withjinja(self.templatepath).render({"in1": in1})
        if self.templatesrc == "local":
            with open(templatepath) as f:
                txt = '\n'.join(f.readlines())
        else:
            txt = self.template
        html = withjinja(txt).render({"in1": in1})
        if self.dest == "local":
            if (os.path.isdir(os.path.dirname(os.path.abspath(pathfile)))) is False:
                os.makedirs(os.path.dirname(os.path.abspath(pathfile)))
            with open(pathfile, 'w') as f:
                f.write(html)
        else:
            cnopts = pysftp.CnOpts()
            cnopts.hostkeys = None
            with pysftp.Connection(self.locserver, username=self.locuser, password=self.locpassword, cnopts=cnopts) as sftp:
                with sftp.open(pathfile, 'w') as f:
                    f.write(html)
        return in1


class Htmljinja(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['htmljinja'] = RuntimeHtmljinja
