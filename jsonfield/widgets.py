from django import forms
from django.utils import simplejson as json
from django.conf import settings

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
            settings.STATICFILES_URL + 'js/jquery.min.js',
            settings.STATICFILES_URL + 'js/jquery.tmpl.js',
            settings.STATICFILES_URL + 'js/form2object.js',
            settings.STATICFILES_URL + 'js/json-table.js',
            settings.STATICFILES_URL + 'js/json-table-templates.js',
        )