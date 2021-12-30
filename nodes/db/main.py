import pandas
from nodes import Node, DictNodes, Runtime, withjinja
from sqlalchemy import create_engine
import pysftp
import tempfile
import os
import uuid
from openpyxl import load_workbook

__version__ = "0.7.2"


class RuntimeDb(Runtime):
    def __init__(self, id, idrun, name, log, **kw):
        Runtime.__init__(self, id, idrun, name, ['in1', ], log)
        if len(kw['port'].strip()) == 0:
            kw['port'] = "1433"
        for key in kw:
            self.__setattr__(key, kw[key].strip())
        if self.method.strip() == "":
            self.method = None
        if len(self.optioncnx.strip()) > 0:
            self.optioncnx = "?%s" % self.optioncnx
        if self.dropindex == 'true':
            self.dropindex = False
        else:
            self.dropindex = True

    def run(self, in1):
        table = withjinja(self.table).render({"in1": in1})
        query = withjinja(self.query).render({"in1": in1})
        pathfile = withjinja(self.pathfile).render({"in1": in1})
        sheet = withjinja(self.sheet).render({"in1": in1})
        if self.type in ('mssql', 'pgsql', 'mysql', 'sqlite'):
            if self.type == 'mssql':
                cnx_str = "mssql+pymssql://%s:%s@%s:%s/%s%s" % (self.user, self.password, self.server, self.port, self.database, self.optioncnx)
                con = create_engine(cnx_str)
            if self.type == 'pgsql':
                cnx_str = "pgsql+psycopg2://%s:%s@%s:%s/%s%s" % (self.user, self.password, self.server, self.port, self.database, self.optioncnx)
                con = create_engine(cnx_str)
            if self.type == 'mysql':
                cnx_str = "pgsql+pymysql://%s:%s@%s:%s/%s%s" % (self.user, self.password, self.server, self.port, self.database, self.optioncnx)
            if self.type == 'sqlite':
                cnx_str = "sqlite:///%s" % self.url
                con = create_engine(cnx_str)
            if self.type == 'odbc':
                cnx_str = self.url
                con = create_engine(cnx_str)
            if self.action == 'read':
                if len(table) > 0:
                    query = "select * from %s" % table
                return pandas.read_sql_query(query, con=con)
            if self.action == 'write':
                in1.to_sql(self.table, con=con, if_exists=self.ifexists, method=self.method, index=self.dropindex)
                return in1
        if self.type in ('csv', 'xlsx', 'json', 'xml'):
            if self.action == 'read':
                if self.loc == 'local':
                    if self.type == 'csv':
                        return pandas.read_csv(pathfile, sep=self.delimiter)
                    if self.type == 'xlsx':
                        return pandas.read_excel(pathfile, sheet_name=sheet)
                    if self.type == 'json':
                        return pandas.read_json(pathfile)
                    if self.type == 'xml':
                        return pandas.read_xml(pathfile)
                if self.loc == 'sftp':
                    cnopts = pysftp.CnOpts()
                    cnopts.hostkeys = None
                    with pysftp.Connection(self.locserver, username=self.locuser, password=self.locpassword, cnopts=cnopts) as sftp:
                        with sftp.open(pathfile) as f:
                            if self.type == 'csv':
                                return pandas.read_csv(f, sep=self.delimiter)
                            if self.type == 'json':
                                return pandas.read_json(f, orient=self.orient)
                            if self.type == 'xml':
                                return pandas.read_xml(f)
                        if self.type == 'xlsx':
                            dirpath = tempfile.mkdtemp()
                            path = os.path.join(dirpath, pathfile.split("/")[-1])
                            sftp.get(pathfile, path)
                            return pandas.read_excel(f, sheet_name=sheet)
            if self.action == 'write':
                if self.loc == 'local':
                    if (os.path.isdir(os.path.dirname(os.path.abspath(pathfile)))) is False:
                        os.makedirs(os.path.dirname(os.path.abspath(pathfile)))
                    if self.type == 'csv':
                        in1.to_csv(pathfile, sep=self.delimiter, index=self.dropindex)
                    if self.type == 'xlsx':
                        if os.path.isfile(pathfile) is True:
                            book = load_workbook(pathfile)
                            writer = pandas.ExcelWriter(pathfile, engine='openpyxl')
                            writer.book = book
                            in1.to_excel(writer, sheet_name=sheet, index=self.dropindex)
                            writer.save()
                            writer.close()
                        else:
                            in1.to_excel(pathfile, sheet_name=sheet, index=self.dropindex)
                    if self.type == 'json':
                        in1.to_json(pathfile, index=self.dropindex)
                    if self.type == 'xml':
                        in1.to_xml(pathfile, index=self.dropindex)
                if self.loc == 'sftp':
                    cnopts = pysftp.CnOpts()
                    cnopts.hostkeys = None
                    with pysftp.Connection(self.locserver, username=self.locuser, password=self.locpassword, cnopts=cnopts) as sftp:
                        if self.type in ('csv', 'json', 'xml'):
                            with sftp.open(pathfile, 'w') as f:
                                if self.type == 'csv':
                                    f.write(in1.to_csv(sep=self.delimiter, index=self.dropindex))
                                if self.type == 'json':
                                    f.write(in1.to_json(orient=self.orient, index=self.dropindex))
                                if self.type == 'xml':
                                    f.write(in1.to_xml(index=self.dropindex))
                        else:
                            dirpath = tempfile.mkdtemp()
                            path = os.path.join(dirpath, '%s.xlsx' % str(uuid.uuid4()))
                            if sftp.exists(pathfile) is True:
                                sftp.get(pathfile, path)
                                sftp.remove(pathfile)
                                book = load_workbook(path)
                                writer = pandas.ExcelWriter(path, engine='openpyxl')
                                writer.book = book
                                in1.to_excel(writer, sheet_name=sheet, index=self.dropindex)
                                writer.save()
                                writer.close()
                            else:
                                in1.to_excel(path, sheet_name=sheet, index=self.dropindex)
                            sftp.put(path, self.pathfile)
                return in1


class Db(Node):
    def __init__(self, *args, **kw):
        Node.__init__(self, *args, **kw)
        DictNodes()['db'] = RuntimeDb
