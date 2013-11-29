import json

from django import forms
from django.utils import six

from .widgets import JSONWidget


class JSONFormField(forms.CharField):
    def __init__(self, *args, **kwargs):
        if 'widget' not in kwargs:
            kwargs['widget'] = JSONWidget
        super(JSONFormField, self).__init__(*args, **kwargs)

    def to_python(self, value):
        if not value:
            return value or ''
        
        if isinstance(value, six.string_types):
            try:
                return json.loads(value)
            except Exception as exc:
                raise forms.ValidationError(
                    'JSON decode error: %s' % (unicode(exc),)
                )
        else:
            return value
        