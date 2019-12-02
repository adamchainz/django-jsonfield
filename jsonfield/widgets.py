import json

import django
from django import forms
import six

from .utils import default


class JSONWidget(forms.Textarea):
    def render(self, name, value, attrs=None, renderer=None):
        if value is None:
            value = ""
        if not isinstance(value, six.string_types):
            value = json.dumps(value, ensure_ascii=False, indent=2,
                               default=default)
        if django.VERSION < (2, 0):
            return super(JSONWidget, self).render(name, value, attrs)

        return super(JSONWidget, self).render(name, value, attrs, renderer)


class JSONSelectWidget(forms.SelectMultiple):
    pass
