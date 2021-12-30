from flask_login import current_user
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import hashlib
import json
from db import db


class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, index=True, unique=True)
    name = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)
    lastconnection = db.Column(db.Date, nullable=True)
    isadmin = db.Column(db.Boolean, default=False, nullable=False)
    gravatar = db.Column(db.Boolean, default=False, nullable=False)
    apikey = db.Column(db.String, nullable=True)
    token = db.Column(db.String, nullable=True)
    group = db.Column(db.String, nullable=True)

    def save(self):
        db.Model.save(self)
        if self.personnalproject is not None:
            prj = Project(ispersonnal=True, name="personnal", resume="")
            prj.save()
            link = ProjectUser(iduser=self.id, idproject=prj.id)
            link.save()

    @property
    def personnalproject(self):
        for link in ProjectUser.query.filter_by(iduser=self.id).all():
            if Project.get(id=link.idproject).ispersonnal is True:
                return Project.get(id=link.idproject)
        return None

    @property
    def projects(self):
        return [Project.get(id=link.idproject) for link in ProjectUser.query.filter_by(iduser=self.id)]

    def __setattr__(self, name, value):
        if name in ('isadmin', 'gravatar') and type(value) == str:
            if value in ['true', 'True']:
                value = True
            else:
                value = False
        if name == 'password':
            value = generate_password_hash(value)
        db.Model.__setattr__(self, name, value)

    def __getattribute__(self, name):
        if name in ('lastconnection'):
            if db.Model.__getattribute__(self, name) is not None:
                return db.Model.__getattribute__(self, name).strftime('%d/%m/%Y')
            else:
                return ""
        if name == 'urlgravatar':
            return "https://www.gravatar.com/avatar/" + hashlib.md5(self.email.encode().lower()).hexdigest()
        if name == "flows":
            return []
        if name not in ('id') and db.Model.__getattribute__(self, name) is None:
            return ""
        return db.Model.__getattribute__(self, name)

    def is_active(self):
        """True, as all users are active."""
        return True

    def get_id(self):
        """Return the id to satisfy Flask-Login's requirements."""
        return self.id

    def is_anonymous(self):
        """False, as anonymous users aren't supported."""
        return False

    def is_authenticated(self):
        return True

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def has_authorization(self, modul, key):
        if self.isadmin is True:
            return True
        authorizations = Authorization.get(self.group)
        for authorization in authorizations:
            if authorization.modul == modul and authorization.key == key:
                return True
        return False

    def flow_authorization(self, id):
        if Project.get(Flow.get(id).project) in self.projects:
            return True
        return False

    def remove(self):
        for link in ProjectUser.query.filter_by(iduser=self.id).all():
            link.remove()
        db.Model.remove(self)


class GroupOfAuthorization(db.Model):
    __tablename__ = 'groupofauthorization'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)

    def clean_authorization(self):
        for auth in Authorization.query.filter_by(idgroup=self.id).all():
            auth.remove()

    def add_authorisation(self, modul, key):
        auth = Authorization()
        auth.idgroup = self.id
        auth.modul = modul
        auth.key = key
        auth.save()

    @property
    def authorizations(self):
        return Authorization.query.filter_by(idgroup=self.id).all()


class Authorization(db.Model):
    __tablename__ = 'authorization'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    idgroup = db.Column(db.Integer, nullable=False)
    modul = db.Column(db.String, nullable=False)
    key = db.Column(db.String, nullable=False)

    @classmethod
    def get(cls, idgroup):
        try:
            return cls.query.filter_by(idgroup=idgroup).all()
        except Exception:
            return None


class Param(db.Model):
    __tablename__ = 'param'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key = db.Column(db.String, nullable=False)
    module = db.Column(db.String, nullable=False)
    value = db.Column(db.String, nullable=True)

    @classmethod
    def get(cls, module, key):
        try:
            return cls.query.filter_by(key=key).first()
        except Exception:
            return None

    @classmethod
    def getValue(cls, module, key, default=""):
        try:
            return cls.query.filter_by(key=key).first().value
        except Exception:
            return None


class ParamRegister(Param):
    __tablename__ = 'param'

    @classmethod
    def get(cls, key):
        return Param.get('register', key)

    @classmethod
    def getValue(cls, key, default=""):
        return Param.getValue('register', key, default)

    def __setattr__(self, name, value):
        db.Model.__setattr__(self, name, value)
        db.Model.__setattr__(self, 'module', 'register')


class ParamApp(Param):
    __tablename__ = 'param'

    @classmethod
    def get(cls, key):
        return Param.get('app', key)

    @classmethod
    def getValue(cls, key, default=""):
        return Param.getValue('app', key, default)

    def __setattr__(self, name, value):
        db.Model.__setattr__(self, name, value)
        db.Model.__setattr__(self, 'module', 'app')


class Project(db.Model):
    __tablename__ = 'project'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    ispersonnal = db.Column(db.Boolean, default=False, nullable=False)
    resume = db.Column(db.String, nullable=True)

    def clearuser(self):
        for link in ProjectUser.query.filter_by(idproject=self.id).all():
            link.remove()

    def adduser(self, user):
        link = ProjectUser(iduser=user.id, idproject=self.id)
        link.save()

    @property
    def flows(self):
        return Flow.query.filter_by(project=self.id).all()

    @property
    def users(self):
        return [User.get(elt.iduser) for elt in ProjectUser.query.filter_by(idproject=self.id).all()]

    def remove(self):
        for flow in self.flows:
            flow.remove()
        db.Model.remove(self)


class ProjectUser(db.Model):
    __tablename__ = 'projectuser'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    idproject = db.Column(db.Integer, nullable=False)
    iduser = db.Column(db.Integer, nullable=False)


class Flow(db.Model):
    __tablename__ = 'flow'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    lastmodified = db.Column(db.String, nullable=True)
    lastmodifiedby = db.Column(db.String, nullable=True)
    project = db.Column(db.String, nullable=False)
    map = db.Column(db.String, nullable=True)

    def __getattribute__(self, name):
        if name == 'name':
            return json.loads(self.map)['flow'].get('name', '')
        if name == 'resume':
            return json.loads(self.map)['flow'].get('resume', '')
        if name == 'versions':
            return [version for version in FlowVersion.query.filter_by(idflow=self.id).order_by(FlowVersion.lastmodified.desc()).all()]
        return db.Model.__getattribute__(self, name)

    def save(self):
        try:
            self.lastmodifiedby = current_user.name
        except Exception:
            self.lastmodifiedby = 'external'
        self.lastmodified = datetime.datetime.now()
        db.Model.save(self)

    def version(self, version):
        if version == "last":
            return self
        return FlowVersion.query.filter_by(idflow=self.id, version=version).first()

    def add_version(self, version):
        if version not in self.versions:
            flowversion = FlowVersion()
            flowversion.version = version
            flowversion.idflow = self.id
            flowversion.map = self.map
            flowversion.save()
            return flowversion
        else:
            raise Exception("%s exist" % version)

    def remove(self):
        for version in self.versions:
            version.remove()
        db.Model.remove(self)


class FlowVersion(db.Model):
    __tablename__ = 'flowversion'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    idflow = db.Column(db.Integer, nullable=False)
    lastmodified = db.Column(db.String, nullable=True)
    lastmodifiedby = db.Column(db.String, nullable=True)
    version = db.Column(db.String, nullable=False)
    map = db.Column(db.String, nullable=True)

    def __getattribute__(self, name):
        if name == 'name':
            return json.loads(self.map)['flow']['name']
        if name == 'resume':
            return json.loads(self.map)['flow']['resume']
        if name == 'lastmodifiedshort':
            return self.lastmodified.split(' ')[0]
        return db.Model.__getattribute__(self, name)

    def save(self):
        try:
            self.lastmodifiedby = current_user.name
        except Exception:
            self.lastmodifiedby = 'external'
        self.lastmodified = datetime.datetime.now()
        db.Model.save(self)
