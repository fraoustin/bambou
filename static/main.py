#!/usr/bin/env python
# -*- coding: utf-8 -*-

from os.path import abspath
from functools import wraps
from flask import Blueprint, send_from_directory, redirect, request


__version__ = '0.1.0'


def static_web_index(path='.'):
    """
    return index.html
    """
    return send_from_directory(path, "index.html")


def static_web(filename, path='..'):
    """
    return filename in path
    redirect for index.html
    """
    if filename == "index.html":
        return redirect(request.url[:-1 * len('index.html')])
    return send_from_directory(path, filename)


def add_path(path):
    """
    add path
    """
    def decorator(func):
        """
        decorator for add path
        """
        @wraps(func)
        def oncall(*args, **kw):
            """
            technical function for add path in kw
            """
            kw["path"] = path
            return func(*args, **kw)
        return oncall
    return decorator


class Static(Blueprint):
    """
        class Static
        Blueprint module for static web
    """
    def __init__(self, name='static', import_name=__name__, url_prefix="", path='.', *args, **kwargs):
        """
        BlueStatic
        Blueprint module for static web
        :param path: The path of directory sharing
        :type path: str
        """
        Blueprint.__init__(self, name, import_name, url_prefix=url_prefix, *args, **kwargs)
        path = abspath(path)
        self.add_url_rule('/<path:filename>', 'static_web', add_path(path)(static_web))
        self.add_url_rule('/', 'static_web_index', add_path(path)(static_web_index))

    def register(self, app, options):
        try:
            Blueprint.register(self, app, options)
        except Exception:
            app.logger.error("init static on register is failed")
