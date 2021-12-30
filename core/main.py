from flask import Blueprint, flash, redirect, url_for, request, render_template, current_app
from flask_login import login_required, current_user
from auth import checkAdmin, User
import json
import os
import shutil
import time
import logging
import threading

from db.models import Project, Flow, FlowVersion
from nodes import runMap, get_random_string, DictRun

__version__ = '0.1.0'

LEVEL_LOG = {'debug': logging.DEBUG,
            'info': logging.INFO,
            'warning': logging.WARNING,
            'error': logging.ERROR,
            'critical': logging.CRITICAL}


class checkAuthorizationFlow(object):

    def __call__(self, fn):
        def wrapped_f(id, *args, **kwargs):
            if current_user.flow_authorization(id):
                return fn(id, *args, **kwargs)
            flash('You are not authorized', 'error')
            return redirect("/")
        return wrapped_f


class ThreadRun(threading.Thread):
    def __init__(self, fun, *args):
        threading.Thread.__init__(self)
        self.daemon = True
        self.fun = fun
        self.args = args

    def run(self):
        self.fun(*self.args)


@login_required
def core():
    return render_template('core.html', user=current_user)


@login_required
@checkAuthorizationFlow()
def flow(id):
    return render_template('flow.html', flow=Flow.get(id=id), nodes=current_app.config['NODES'])


@login_required
@checkAuthorizationFlow()
def run(id):
    version = request.form.get('version', 'last')
    flow = Flow.get(id=id).version(version)
    if flow is None:
        return {"status": "error"}, 418
    levellog = LEVEL_LOG.get(request.form.get('levellog', 'info'), logging.INFO)
    if 'log' in request.form:
        log = request.form['log']
        try:
            filelog = open(log, 'w')
            filelog.close()
        except Exception:
            return {"status": "error with log"}, 418
    else:
        log = os.path.join(current_app.config.get("APP_LOGS", ""), str(id), '%s.log' % time.time())
    uid = get_random_string(20)
    thread = ThreadRun(runMap, flow.map, log, levellog, request.form.get('env', ''), version, uid)
    thread.start()
    return {"log": os.path.split(log)[-1], "uid": uid}, 200


@login_required
@checkAuthorizationFlow()
def stop(id, uid):
    if DictRun()[uid]["id"] == id:
        DictRun()[uid]["state"] = False
    return {"state": "stop", "uid": uid}, 200


@login_required
@checkAuthorizationFlow()
def logs(id):
    logs = os.listdir(os.path.join(current_app.config.get("APP_LOGS", ""), str(id)))
    logs.sort(reverse=True)
    return json.dumps([[log, time.strftime('%Y/%m/%d %H:%M', time.gmtime(float(log[:-4])))] for log in logs if os.path.isfile(os.path.join(current_app.config.get("APP_LOGS", ""), str(id), log)) and log.endswith('.log')])


@login_required
@checkAuthorizationFlow()
def log(id, idlog):
    lines = []
    if os.path.isfile(os.path.join(current_app.config.get("APP_LOGS", ""), str(id), idlog)):
        with open(os.path.join(current_app.config.get("APP_LOGS", ""), str(id), idlog), 'r') as f:
            lines = f.readlines()
    return ''.join(lines)


@login_required
@checkAuthorizationFlow()
def dellog(id, idlog):
    try:
        os.remove(os.path.join(current_app.config.get("APP_LOGS", ""), str(id), idlog))
        return {"status": "ok"}, 200
    except Exception:
        return {"status": "error"}, 418


@login_required
@checkAuthorizationFlow()
def setmap(id):
    flow = Flow.get(id=id)
    if flow is not None:
        flow.map = request.form['map']
        flow.save()
    return {"status": "ok"}, 200


@login_required
@checkAuthorizationFlow()
def versions(id):
    flow = Flow.get(id=id)
    if flow is not None:
        return json.dumps([[ver.id, ver.version, ver.lastmodifiedshort] for ver in flow.versions])
    return [], 200


@login_required
@checkAuthorizationFlow()
def add_version(id):
    flow = Flow.get(id=id)
    flow.add_version(request.form['version'])
    return redirect(url_for('core.flow', id=flow.id))


@login_required
@checkAuthorizationFlow()
def delversion(id, idversion):
    try:
        flowversion = FlowVersion.get(id=idversion)
        flowversion.remove()
        return {"status": "ok"}, 200
    except Exception:
        return {"status": "error"}, 418


@login_required
@checkAuthorizationFlow()
def getmap(id):
    flow = Flow.get(id=id)
    if flow is not None and flow.map is not None:
        return flow.map
    return {'status': 'error'}, 418


@login_required
def create_flow():
    flow = Flow()
    flow.project = request.form['project']
    flow.save()
    flow.map = json.dumps({
        'flow': {
            'id': flow.id,
            'name': request.form['name'],
            'resume': request.form['resume']
        },
        'map': [],
        'env': {}})
    flow.save()
    os.makedirs(os.path.join(current_app.config.get("APP_LOGS", ""), str(flow.id)), exist_ok=True)
    flash('Flow %s is created' % flow.name, 'success')
    return redirect(url_for('core.flow', id=flow.id))


@login_required
@checkAuthorizationFlow()
def update_flow(id):
    flow = Flow.get(id=id)
    if flow is not None:
        flow.project = request.form['project']
        data = json.loads(flow.map)
        data['flow']['resume'] = request.form['resume']
        flow.map = json.dumps(data)
        flow.save()
        flash('Flow %s is saved' % flow.name, 'success')
    else:
        flash('Flow doesn\'t exist', 'error')
    return redirect(url_for('core.core', ))


@login_required
@checkAuthorizationFlow()
def delete_flow(id):
    flow = Flow.get(id=id)
    if flow is not None:
        name = flow.name
        try:
            shutil.rmtree(os.path.join(current_app.config.get("APP_LOGS", ""), str(flow.id)))
        except Exception:
            pass
        flow.remove()
        flash('Flow %s is deleted' % name, 'error')
    return redirect(url_for('core.core', ))


@login_required
@checkAdmin()
def projects():
    return render_template('projects.html', projects=Project.query.filter_by(ispersonnal=False).order_by(Project.name).all(), users=User.all(sortby=User.name), current_user=current_user)


@login_required
@checkAdmin()
def create_project():
    prj = Project()
    prj.name = request.form['name']
    prj.resume = request.form['resume']
    prj.save()
    for user in [User.get(int(key[4:])) for key in request.form.keys() if key.startswith('user')]:
        prj.adduser(user)
    flash('Project %s is created' % prj.name, 'success')
    return redirect(url_for('core.projects', ))


@login_required
@checkAdmin()
def update_project(id):
    prj = Project.get(id=id)
    if prj is not None:
        prj.name = request.form['name']
        prj.resume = request.form['resume']
        prj.save()
        prj.clearuser()
        for user in [User.get(int(key[4:])) for key in request.form.keys() if key.startswith('user')]:
            prj.adduser(user)
        flash('Project %s is saved' % prj.name, 'success')
    else:
        flash('Project doesn\'t exist', 'error')
    return redirect(url_for('core.projects', ))


@login_required
@checkAdmin()
def delete_project(id):
    prj = Project.get(id=id)
    if prj is not None:
        name = prj.name
        prj.remove()
        flash('Project %s is deleted' % name, 'error')
    return redirect(url_for('core.projects', ))


class Core(Blueprint):
    def __init__(self, name='core', import_name=__name__, *args, **kwargs):
        Blueprint.__init__(self, name, import_name, template_folder='templates', *args, **kwargs)
        self.add_url_rule('/', 'core', core, methods=['GET'])
        self.add_url_rule('/flow', 'create_flow', create_flow, methods=['POST'])
        self.add_url_rule('/flow/<int:id>', 'update_flow', update_flow, methods=['POST'])
        self.add_url_rule('/flow/<int:id>', 'flow', flow, methods=['GET'])
        self.add_url_rule('/flow/<int:id>/run', 'run', run, methods=['POST'])
        self.add_url_rule('/flow/<int:id>/stop/<string:uid>', 'stop', stop, methods=['GET'])
        self.add_url_rule('/flow/<int:id>/logs', 'logs', logs, methods=['GET'])
        self.add_url_rule('/flow/<int:id>/log/<string:idlog>', 'log', log, methods=['GET'])
        self.add_url_rule('/flow/<int:id>/log/<string:idlog>/del', 'dellog', dellog, methods=['GET'])
        self.add_url_rule('/flow/<int:id>/versions', 'versions', versions, methods=['GET'])
        self.add_url_rule('/flow/<int:id>/version', 'add_version', add_version, methods=['POST'])
        self.add_url_rule('/flow/<int:id>/version/<int:idversion>/del', 'delversion', delversion, methods=['GET'])
        self.add_url_rule('/map/<int:id>', 'setmap', setmap, methods=['POST'])
        self.add_url_rule('/map/<int:id>', 'getmap', getmap, methods=['GET'])
        self.add_url_rule('/delflow/<int:id>', 'delete_flow', delete_flow, methods=['POST'])
        self.add_url_rule('/project', 'create_project', create_project, methods=['POST'])
        self.add_url_rule('/project/<int:id>', 'update_project', update_project, methods=['POST'])
        self.add_url_rule('/delproject/<int:id>', 'delete_project', delete_project, methods=['POST'])
        self.add_url_rule('/projects', 'projects', projects, methods=['GET'])

    def register(self, app, options):
        try:
            Blueprint.register(self, app, options)
        except Exception:
            app.logger.error("init core on register is failed")
