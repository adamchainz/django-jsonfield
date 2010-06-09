from django.db import models
from django import forms
from django.utils import simplejson as json
 
class JSONWidget(forms.Textarea):
    def render(self, name, value, attrs=None):
        if not isinstance(value, basestring):
            value = json.dumps(value, indent=2)
        return super(JSONWidget, self).render(name, value, attrs)

class JSONListWidget(forms.SelectMultiple):
    pass

class JSONFormField(forms.CharField):
    def __init__(self, *args, **kwargs):
        kwargs['widget'] = JSONWidget
        super(JSONFormField, self).__init__(*args, **kwargs)

    def clean(self, value):
        """
        The default is to have a TextField, and we will decode the string
        that comes back from this. However, another use of this field is
        to store a list of values, and use these in a MultipleSelect
        widget. So, if we have an object that isn't a string, then for now
        we will assume that is where it has come from.
        """
        if not value or value == "null": 
            return
        if isinstance(value, (str, unicode)):
            try:
                return json.loads(value)
            except Exception, exc:
                raise forms.ValidationError(u'JSON decode error: %s' % (unicode(exc),))
        else:
            return value


class JSONField(models.TextField):
    __metaclass__ = models.SubfieldBase

    def formfield(self, **kwargs):
        return super(JSONField, self).formfield(form_class=JSONFormField, **kwargs)

    def to_python(self, value):
        if isinstance(value, basestring):
            value = json.loads(value)
        return value

    def get_db_prep_save(self, value):
        if value is None: return
        return json.dumps(value)

    def value_to_string(self, obj):
        value = self._get_val_from_obj(obj)
        return self.get_db_prep_value(value)


try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], ['^jsonfield\.fields\.JSONField'])
except ImportError:
    pass