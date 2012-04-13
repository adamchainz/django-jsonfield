import os
from setuptools import setup

setup(
    name = "django-jsonfield",
    version = open(os.path.join(os.path.dirname(__file__), 'jsonfield', 'VERSION')).read().strip(),
    description = "JSONField for django models",
    long_description = open("README.rst").read(),
    url = "http://bitbucket.org/schinckel/django-jsonfield/",
    author = "Matthew Schinckel",
    author_email = "matt@schinckel.net",
    packages = [
        "jsonfield",
    ],
    include_package_data=True,
    classifiers = [
        'Programming Language :: Python',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Framework :: Django',
    ],
    test_suite='tests.main',
)
