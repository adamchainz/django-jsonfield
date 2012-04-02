import os
import sys
import unittest
import doctest
import django

BASE_PATH = os.path.dirname(__file__) + 'jsonfield/'

def main():
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
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    # Django 1.1 compat
    global_settings.DATABASE_ENGINE = "sqlite3"
    global_settings.DATABASE_NAME = ":memory:"
 

    global_settings.STATIC_URL = "/static/"
    global_settings.MEDIA_ROOT = os.path.join(BASE_PATH, 'static')
    global_settings.STATIC_ROOT = global_settings.MEDIA_ROOT

    from django.test.utils import get_runner
    test_runner = get_runner(global_settings)

    if django.VERSION > (1,2):
        test_runner = test_runner()
        failures = test_runner.run_tests(['jsonfield'])
    else:
        failures = test_runner(['jsonfield'], verbosity=1)
    sys.exit(failures)

if __name__ == '__main__':
    main()
