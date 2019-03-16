#!/usr/bin/env python
import os
from setuptools import setup

with open(os.path.join(os.path.dirname(__file__), 'jsonfield', 'VERSION')) as fp:
    version = fp.read().strip()

with open("README.rst") as fp:
    long_description = fp.read()

setup(
    name="django-jsonfield",
    version=version,
    description="JSONField for django models",
    long_description=long_description,
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
        'Django>=1.9',
    ],
    classifiers=[
        "Development Status :: 6 - Mature",
        'Framework :: Django',
        "Framework :: Django :: 1.9",
        "Framework :: Django :: 1.10",
        "Framework :: Django :: 1.11",
        "Framework :: Django :: 2.0",
        "Framework :: Django :: 2.1",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 3",
    ],
)
