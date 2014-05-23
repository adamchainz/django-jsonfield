from django.test import TestCase

from jsonfield.tests.jsonfield_test_app.models import JSONFieldTestModel

class TestHasKeyLookup(TestCase):
    def test_lookup_is_installed(self):
        JSONFieldTestModel.objects.filter(json__has_key='a')