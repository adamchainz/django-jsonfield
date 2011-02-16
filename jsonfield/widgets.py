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
        # TODO: move these into our subdirectory, and use shared versions of jquery/tmpl.
        if hasattr(settings, 'STATIC_URL') and settings.STATIC_URL:
            js = (
                settings.STATIC_URL + 'js/jquery-1.4.4.js',
                settings.STATIC_URL + 'js/jquery.tmpl.js',
                settings.STATIC_URL + 'js/form2object.js',
                settings.STATIC_URL + 'js/json-table.js',
                settings.STATIC_URL + 'js/json-table-templates.js',
            )