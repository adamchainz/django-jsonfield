#!/usr/bin/env python
import os
import codecs
from setuptools import setup

with open("README.rst") as fp:
    long_description = fp.read()

try:
    with codecs.open(
        os.path.join(os.path.dirname(__file__), 'jsonfield', 'version.txt'),
        mode='rb',
        encoding='utf8',
    ) as _version_file:
        __version__ = _version_file.read().strip()
except Exception as e:
    __version__ = 'dummy'

setup(
    name="django-jsonfield",
    version=__version__,
    description="JSONField for django models",
    long_description=long_description,
    long_description_content_type="text/x-rst",
    url="https://github.com/adamchainz/django-jsonfield",
    author="Matthew Schinckel",
    author_email="matt@schinckel.net",
    maintainer="Adam Johnson",
    maintainer_email="me@adamj.eu",
    packages=[
        "jsonfield",
    ],
    include_package_data=True,
    test_suite='tests.main',
    install_requires=[
        'Django>=1.8',
        'MySQL-python==1.2.5;python_version<"3.5"',
        'mysqlclient==1.3.14;python_version>="3.5"',
        'six',
    ],
    classifiers=[
        "Development Status :: 6 - Mature",
        'Framework :: Django',
        "Framework :: Django :: 1.8",
        "Framework :: Django :: 1.11",
        "Framework :: Django :: 2.0",
        "Framework :: Django :: 2.1",
        "Framework :: Django :: 2.2",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 3",
    ],
)
