import unittest
if not hasattr(unittest, 'skipIf'):
    import unittest2 as unittest

import django
from django.test import TestCase

from jsonfield.tests.jsonfield_test_app.models import JSONFieldTestModel

@unittest.skipIf(django.VERSION < (1, 7, 0), 'Lookups not supported in django < 1.7')
class TestHasKeyLookup(TestCase):
    def test_lookup_is_installed(self):
        a = JSONFieldTestModel.objects.create(json={'a': 1})
        b = JSONFieldTestModel.objects.create(json={'b': 1})
        results = JSONFieldTestModel.objects.filter(json__has_key='a')
        self.assertEquals(set([a]), set(results))