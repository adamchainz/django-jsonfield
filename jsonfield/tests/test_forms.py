from django.test import TestCase as DjangoTestCase
from django.utils import unittest

from jsonfield.forms import JSONFormField
from jsonfield.tests.jsonfield_test_app.forms import JSONTestForm, JSONTestModelForm

class JSONFormFieldTest(DjangoTestCase):
    def test_form_field_clean(self):
        field = JSONFormField(required=False)
        self.assertEquals({}, field.clean('{}'))
        
        self.assertEquals(
            {'foo':'bar', 'baz':2},
            field.clean('{"foo":"bar","baz":2}')
        )
        
        self.assertEquals([],field.clean('[]'))

class JSONFormTest(DjangoTestCase):
    def test_form_clean(self):
        form = JSONTestForm({})
        self.assertFalse(form.is_valid())


class JSONFormMultipleSelectFieldTest(DjangoTestCase):
    def test_multiple_select_data(self):
        form = JSONTestForm({'json_data': [u'SA', u'WA']})
        assert form.is_valid()
        
        self.assertEquals([u'SA', u'WA'], form.cleaned_data['json_data'])
