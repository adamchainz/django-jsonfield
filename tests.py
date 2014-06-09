import os
import sys
import unittest
import doctest
import django

BASE_PATH = os.path.dirname(__file__)

def main(db_engine='sqlite3'):
    """
    Standalone django model test with a 'memory-only-django-installation'.
    You can play with a django model without a complete django app installation.
    http://www.djangosnippets.org/snippets/1044/
    """
    os.environ["DJANGO_SETTINGS_MODULE"] = "django.conf.global_settings"
    from django.conf import global_settings

    global_settings.INSTALLED_APPS = (
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'jsonfield',
    )
    global_settings.DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.%s' % db_engine,
            'NAME': 'django-jsonfield',
        }
    } 

    global_settings.STATIC_URL = "/static/"
    global_settings.MEDIA_ROOT = os.path.join(BASE_PATH, 'static')
    global_settings.STATIC_ROOT = global_settings.MEDIA_ROOT
    
    global_settings.SECRET_KEY = '334ebe58-a77d-4321-9d01-a7d2cb8d3eea'
    from django.test.utils import get_runner
    test_runner = get_runner(global_settings)

    test_runner = test_runner()
    
    if getattr(django, 'setup', None):
        django.setup()
    
    failures = test_runner.run_tests(['jsonfield'])
    
    sys.exit(failures)

def test_postgres():
    main('postgresql_psycopg2')

if __name__ == '__main__':
    main()
