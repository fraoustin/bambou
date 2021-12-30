from nodes import Node, DictNodes, Runtime, withjinja
import os
import smtplib
from email.message import EmailMessage
import tempfile
import mimetypes

__version__ = "0.2.0"


class RuntimeMail(Runtime):
    def __init__(self, id, idrun, name, log, **kw):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        for key in kw:
            self.__setattr__(key, kw[key])

    def run(self, in1):
        message = EmailMessage()
        message["To"] = (', ').join([mail.strip() for mail in withjinja(self.to).render({"in1": in1}).split(',')])
        message["Cc"] = (', ').join([mail.strip() for mail in withjinja(self.cc).render({"in1": in1}).split(',')])
        message["Bcc"] = (', ').join([mail.strip() for mail in withjinja(self.bcc).render({"in1": in1}).split(',')])
        message["Subject"] = withjinja(self.title).render({"in1": in1})
        message["From"] = self.smtpuser
        message.set_content(withjinja(self.msg).render({"in1": in1}))
        if self.withdata != '':
            dirpath = tempfile.mkdtemp()
            if self.withdata == 'csv':
                with open(os.path.join(dirpath, 'data.csv'), 'w') as f:
                    f.write(in1.to_csv())
                path = os.path.join(dirpath, 'data.csv')
                filename = 'data.csv'
            if self.withdata == 'json':
                with open(os.path.join(dirpath, 'data.json'), 'w') as f:
                    f.write(in1.to_json())
                path = os.path.join(dirpath, 'data.json')
                filename = 'data.json'
            if self.withdata == 'xlsx':
                path = os.path.join(dirpath, 'data.xlsx')
                filename = 'data.xlsx'
                in1.to_excel(path)
            if self.withdata == 'xml':
                with open(os.path.join(dirpath, 'data.xml'), 'w') as f:
                    f.write(in1.to_xml())
                path = os.path.join(dirpath, 'data.xml')
                filename = 'data.xml'
            ctype, encoding = mimetypes.guess_type(path)
            if ctype is None or encoding is not None:
                ctype = 'application/octet-stream'
            maintype, subtype = ctype.split('/', 1)
            with open(path, 'rb') as fp:
                message.add_attachment(fp.read(),
                                    maintype=maintype,
                                    subtype=subtype,
                                    filename=filename)
        for att in self.atts:
            path = withjinja(att).render({"in1": in1})
            head, filename = os.path.split(path)
            ctype, encoding = mimetypes.guess_type(path)
            if ctype is None or encoding is not None:
                ctype = 'application/octet-stream'
            maintype, subtype = ctype.split('/', 1)
            with open(path, 'rb') as fp:
                message.add_attachment(fp.read(),
                                    maintype=maintype,
                                    subtype=subtype,
                                    filename=filename)
        server = smtplib.SMTP(self.smtpserver, int(self.smtpport))
        if self.smtpssl == 'true':
            server.starttls()
        server.login(self.smtpuser, self.smtppassword)
        server.send_message(message)
        server.quit()
        return in1


class Mail(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['mail'] = RuntimeMail
