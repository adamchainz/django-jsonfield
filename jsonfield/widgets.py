from django import forms
from django.utils import simplejson as json
import staticmedia

class JSONWidget(forms.Textarea):
    def render(self, name, value, attrs=None):
        if value is None:
            value = ""
        if not isinstance(value, basestring):
            value = json.dumps(value, indent=2)
        return super(JSONWidget, self).render(name, value, attrs)


class JSONSelectWidget(forms.SelectMultiple):
    pass

class JSONTableWidget(JSONWidget):
    class Media:
        js = (
            staticmedia.url('js/jquery.js'),
            staticmedia.url('js/jquery.tmpl.js'),
            staticmedia.url('js/json-table.js'),
            staticmedia.url('js/json-table-templates.js'),
        )