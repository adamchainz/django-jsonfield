from django.db import models
from django import forms
from django.utils import simplejson as json
from decimal import Decimal
import datetime

from forms import JSONFormField

def default(o):
    if isinstance(o, Decimal):
        return str(o)
    if isinstance(o, datetime.datetime):
        return o.strftime("%Y-%m-%dT%H:%M:%S")
    if isinstance(o, datetime.date):
        return o.strftime("%Y-%m-%d")
    if isinstance(o, datetime.time):
        return o.strftime("%H:%M:%S")
        
    raise TypeError(repr(o) + " is not JSON serializable")


class JSONField(models.TextField):
    """
    A field that will ensure the data entered into it is valid JSON.
    """
    __metaclass__ = models.SubfieldBase
    
    description = "JSON object"
    
    def formfield(self, **kwargs):
        return super(JSONField, self).formfield(form_class=JSONFormField, **kwargs)

    def to_python(self, value):
        if isinstance(value, basestring):
            if value == "":
                return None
            value = json.loads(value)
        return value

    def get_db_prep_save(self, value, connection):
        if value is None: 
            return None
        return json.dumps(value, default=default)
    
    def get_db_prep_value(self, value, connection, prepared=None):
        return self.get_db_prep_save(value, connection=connection)

    def value_to_string(self, obj):
        value = self._get_val_from_obj(obj)
        # Currently just returning the actual value, since otherwise I
        # get a string when I serialize this object, when I really want a
        # data structure.
        # return self.get_db_prep_value(value)
        return value


try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], ['^jsonfield\.fields\.JSONField'])
except ImportError:
    pass