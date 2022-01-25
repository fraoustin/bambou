import os
from cx_Freeze import setup, Executable
import shutil

includefiles = []
includes = ['jinja2.ext', 'sqlalchemy.sql.default_comparator', 'httplib2.socks', 'jinja2_time']

for node in [elt for elt in os.listdir('./nodes') if '__pycache__' not in elt and '__init__.py' not in elt]:
    includes.append("nodes.%s.main" % node)

excludes = ['Tkinter']

setup(
    name='bambou',
    version='0.1',
    description='etl with pandas',
    author='Frederic AOUSTIN',
    author_email='fraoustin@gmail.com',
    options={'build_exe': {'excludes': excludes, 'include_files': includefiles, 'includes': includes, 'build_exe': './build/bambou'}},
    executables=[Executable('bambou.py')]
)

for dir in os.listdir('.'):
    if os.path.isdir(dir) and dir not in ['.git', '__pycache__', 'build']:
        print("copying %s -> %s" % (os.path.join('.', dir), os.path.join('build', 'bambou', dir)))
        shutil.copytree(os.path.join('.', dir), os.path.join('build', 'bambou', dir))
        for root, subdirectories, files in os.walk(os.path.join('build', 'bambou', dir)):
            for file in files:
                if os.path.join(root, file).split('.')[-1] not in ['html', 'js', 'png', 'css', 'woff', 'ico', 'map']:
                    os.remove(os.path.join(root, file))
