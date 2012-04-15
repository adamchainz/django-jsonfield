from django.db import models
from jsonfield import JSONField

class JSONFieldTestModel(models.Model):
    json = JSONField(u"test", null=True, blank=True)
    class Meta:
        app_label = 'jsonfield'

class JSONFieldWithDefaultTestModel(models.Model):
    json = JSONField(default={"sukasuka": "YAAAAAZ"})
    class Meta:
        app_label = 'jsonfield'


class BlankJSONFieldTestModel(models.Model):
    null_json = JSONField(null=True)
    blank_json = JSONField(blank=True)
    class Meta:
        app_label = 'jsonfield'