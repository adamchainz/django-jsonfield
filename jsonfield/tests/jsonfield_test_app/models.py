import json

from django.db import models

from jsonfield.fields import JSONField
from jsonfield.utils import default

class JSONFieldTestModel(models.Model):
    json = JSONField("test", null=True, blank=True)
    class Meta:
        app_label = 'jsonfield'
    
    def __unicode__(self):
        return json.dumps(self.json, default=default)

class JSONFieldWithDefaultTestModel(models.Model):
    json = JSONField(default={"sukasuka": "YAAAAAZ"})
    class Meta:
        app_label = 'jsonfield'

    def __unicode__(self):
        return json.dumps(self.json, default=default)


class BlankJSONFieldTestModel(models.Model):
    null_json = JSONField(null=True)
    blank_json = JSONField(blank=True)
    class Meta:
        app_label = 'jsonfield'

    def __unicode__(self):
        return '{null: %s, blank: %s}' % (
            json.dumps(self.null_json, default=default),
            json.dumps(self.blank_json, default=default),
        )


class CallableDefaultModel(models.Model):
    json = JSONField(default=lambda:{'x':2})
    
    class Meta:
        app_label = 'jsonfield'
    
    def __unicode__(self):
        return json.dumps(self.json, default=default)
    