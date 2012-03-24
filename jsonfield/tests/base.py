#:coding=utf-8:

from django.test import TestCase as DjangoTestCase

from jsonfield.tests.jsonfield_test_app.models import (
    JSONFieldTestModel,
    JSONFieldWithDefaultTestModel
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

    def test_db_prep_value(self):
        field = JSONField(u"test")
        field.set_attributes_from_name("json")
        self.assertEquals(None, field.get_db_prep_value(None))
        self.assertEquals('{"spam":"eggs"}', field.get_db_prep_value({"spam": "eggs"}))

    def test_value_to_string(self):
        field = JSONField(u"test")
        field.set_attributes_from_name("json")
        obj = JSONFieldTestModel(json='''{
            "spam": "eggs"
        }''')
        self.assertEquals(u'{"spam":"eggs"}', field.value_to_string(obj))

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
