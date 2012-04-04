#:coding=utf-8:

from django.test import TestCase as DjangoTestCase
from django.utils import unittest

from jsonfield.tests.jsonfield_test_app.models import (
    JSONFieldTestModel,
    JSONFieldWithDefaultTestModel,
)
from jsonfield import JSONField

class JSONFieldTest(DjangoTestCase):
    def test_json_field(self):
        obj = JSONFieldTestModel(json='''{
            "spam": "eggs"
        }''')
        self.assertEquals(obj.json, {'spam':'eggs'})

    def test_json_field_empty(self):
        obj = JSONFieldTestModel(json='')
        self.assertEquals(obj.json, None)

    def test_json_field_save(self):
        JSONFieldTestModel.objects.create(
            id=10,
            json='''{
                "spam": "eggs"
            }''',
        )
        obj2 = JSONFieldTestModel.objects.get(id=10)
        self.assertEquals(obj2.json, {'spam':'eggs'})

    def test_json_field_save_empty(self):
        JSONFieldTestModel.objects.create(id=10, json='')
        obj2 = JSONFieldTestModel.objects.get(id=10)
        self.assertEquals(obj2.json, None)

    def test_db_prep_save(self):
        field = JSONField(u"test")
        field.set_attributes_from_name("json")
        self.assertEquals(None, field.get_db_prep_save(None))
        self.assertEquals('{"spam": "eggs"}', field.get_db_prep_save({"spam": "eggs"}))

    @unittest.expectedFailure
    def test_value_to_string(self):
        field = JSONField(u"test")
        field.set_attributes_from_name("json")
        obj = JSONFieldTestModel(json='''{
            "spam": "eggs"
        }''')
        self.assertEquals(u'{"spam": "eggs"}', field.value_to_string(obj))

    def test_formfield(self):
        from jsonfield.forms import JSONFormField
        from jsonfield.widgets import JSONWidget
        field = JSONField(u"test")
        field.set_attributes_from_name("json")
        formfield = field.formfield()
        self.assertEquals(type(formfield), JSONFormField)
        self.assertEquals(type(formfield.widget), JSONWidget)

    def test_default_value(self):
        obj = JSONFieldWithDefaultTestModel.objects.create()
        obj = JSONFieldWithDefaultTestModel.objects.get(id=obj.id)
        self.assertEquals(obj.json, {'sukasuka': 'YAAAAAZ'})

    def test_query_object(self):
        JSONFieldTestModel.objects.create(json={})
        JSONFieldTestModel.objects.create(json={'foo':'bar'})
        self.assertEquals(2, JSONFieldTestModel.objects.all().count())
        self.assertEquals(1, JSONFieldTestModel.objects.exclude(json={}).count())
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json={}).count())
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json={'foo':'bar'}).count())
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json__contains={'foo':'bar'}).count())
        JSONFieldTestModel.objects.create(json={'foo':'bar', 'baz':'bing'})
        self.assertEquals(2, JSONFieldTestModel.objects.filter(json__contains={'foo':'bar'}).count())
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json__contains={'baz':'bing', 'foo':'bar'}).count())
        self.assertEquals(2, JSONFieldTestModel.objects.filter(json__contains='foo').count())
        # This code needs to be implemented!
        self.assertRaises(TypeError, lambda:JSONFieldTestModel.objects.filter(json__contains=['baz', 'foo']))
        
    def test_query_isnull(self):
        JSONFieldTestModel.objects.create(json=None)
        JSONFieldTestModel.objects.create(json={})
        JSONFieldTestModel.objects.create(json={'foo':'bar'})
        
        self.assertEquals(1, JSONFieldTestModel.objects.filter(json=None).count())
        self.assertEquals(None, JSONFieldTestModel.objects.get(json=None).json)