django-jsonfield
===================

I had a serious need for a JSON field for django. There were a couple out
there, but none packaged up nicely on bitbucket/github that were usable
with ``pip install -e``.

So I took the code from `David Cramer's blog`_, and packaged it up.

To use, just install the package, and then use the field::


    from django.db import models
    import jsonfield
    
    class MyModel(models.Model):
        the_json = jsonfield.JSONField()
    
Now, it will validate the JSON on entry, and store it as a string in the
database.  When you instantiate/fetch the object, it will be turned back
into a python list/dict/string.

There are also a couple of other bits and bobs:

- jsonify templatetag:
  This allows you to convert a python data structure into JSON within a template.

    {% load jsonify %}
    
    <script>
    var foo = {{ bar|jsonify }};
    </script>
  
History
----------
* 0.8.1 : Removed get_db_prep_value, as querying from a JSON object fails.
          Converting to string does nothing, as serializing a model instance
          with a JSONField would have a string version of that field, instead
          of it embedded inline.
* 0.8 : Supports django 1.2
        Supports callable and json serializable objects as default
        Implemented get_db_prep_value()
        Add tests and test runner.
        Removed JSONTableWidget from README.
* 0.7.1 : Don't fail when trying to install before django is installed.
* 0.7 : First time I tagged releases.


Todo
----------

Allow for more complex querying:

    Model.objects.filter(json__contains={"foo":"bar"})
    
    => Matches anything that has a foo key with a value of bar.

Convert date/time objects nicely to/from ISO strings (YYYY-mm-dd HH:MM:SS 
TZNAME). This is actually a bit tricky, as we don't know if we are expecting
a date/time object. We may parse objects as we go, but there could be
some performance issues with this.

.. _David Cramer's blog: http://justcramer.com/2009/04/14/cleaning-up-with-json-and-sql/