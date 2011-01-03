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
            getattr(settings, 'STATIC_URL', settings.MEDIA_URL) + 'js/jquery-1.4.4.js',
            getattr(settings, 'STATIC_URL', settings.MEDIA_URL) + 'js/jquery.tmpl.js',
            getattr(settings, 'STATIC_URL', settings.MEDIA_URL) + 'js/form2object.js',
            getattr(settings, 'STATIC_URL', settings.MEDIA_URL) + 'js/json-table.js',
            getattr(settings, 'STATIC_URL', settings.MEDIA_URL) + 'js/json-table-templates.js',
        )
