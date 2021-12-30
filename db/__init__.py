from flask_sqlalchemy import SQLAlchemy, Model


class GenericModel(Model):

    @classmethod
    def get(cls, id):
        try:
            return cls.query.filter_by(id=id).first()
        except Exception:
            return None

    @classmethod
    def all(cls, sortby=None):
        if sortby:
            return cls.query.order_by(sortby).all()
        return cls.query.all()

    @classmethod
    def remove(cls, id):
        try:
            cls.query.filter_by(id=id).first().remove()
            return True
        except Exception:
            return False

    def save(self):
        if self.id is None:
            db.session.add(self)
        db.session.commit()

    def remove(self):
        db.session.delete(self)
        db.session.commit()


db = SQLAlchemy(model_class=GenericModel)
