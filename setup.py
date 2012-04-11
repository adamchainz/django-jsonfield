from setuptools import setup

setup(
    name = "django-jsonfield",
    version = '0.8.2',
    description = "JSONField for django models",
    long_description = open("README.rst").read(),
    url = "http://bitbucket.org/schinckel/django-jsonfield/",
    author = "Matthew Schinckel",
    author_email = "matt@schinckel.net",
    packages = [
        "jsonfield",
    ],
    classifiers = [
        'Programming Language :: Python',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Framework :: Django',
    ],
    test_suite='tests.main',
)
