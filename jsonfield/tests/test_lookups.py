try:
    from unittest import skipIf
except ImportError:
    from unittest2 import skipIf

import django
from django.test import TestCase

from jsonfield.tests.jsonfield_test_app.models import JSONFieldTestModel


class TestFieldLookups(TestCase):
    
    def test_exact(self):
        JSONFieldTestModel.objects.create(json={})
        JSONFieldTestModel.objects.create(json={'foo':'bar'})
        self.assertEquals(2, JSONFieldTestModel.objects.all().count())
        self.assertEquals(1, JSONFieldTestModel.objects.exclude(json={}).count())
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json={}).count())
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json={'foo':'bar'}).count())
    
    def test_contains(self):
        JSONFieldTestModel.objects.create(json={})
        JSONFieldTestModel.objects.create(json={'foo':'bar'})
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json__contains={'foo':'bar'}).count())
        JSONFieldTestModel.objects.create(json={'foo':'bar', 'baz':'bing'})
        self.assertEquals(2, JSONFieldTestModel.objects.filter(json__contains={'foo':'bar'}).count())
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json__contains={'baz':'bing', 'foo':'bar'}).count())
    
    def test_isnull(self):
        JSONFieldTestModel.objects.create(json=None)
        JSONFieldTestModel.objects.create(json={})
        JSONFieldTestModel.objects.create(json={'foo':'bar'})

        self.assertEquals(1, JSONFieldTestModel.objects.filter(json=None).count())
        self.assertEquals(None, JSONFieldTestModel.objects.get(json=None).json)
    
    @skipIf(django.VERSION < (1, 7, 0), 'Extra lookups require django 1.7')
    def test_has_key(self):
        a = JSONFieldTestModel.objects.create(json={'a': 1})
        b = JSONFieldTestModel.objects.create(json={'b': 1})
        results = JSONFieldTestModel.objects.filter(json__has_key='a')
        self.assertEquals(set([a]), set(results))