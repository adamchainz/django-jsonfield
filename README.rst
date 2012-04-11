django-jsonfield
===================

I had a serious need for a JSON field for django. There were a couple out
there, but none packaged up nicely on bitbucket/github that were usable
with ``pip install -e``.

So I took the code from `David Cramer's blog`_, and packaged it up.

Usage
-----

To use, just install the package, and then use the field::

    from django.db import models
    import jsonfield
    
    class MyModel(models.Model):
        the_json = jsonfield.JSONField()
    
Now, it will validate the JSON on entry, and store it as a string in the
database.  When you instantiate/fetch the object, it will be turned back
into a python list/dict/string.

There are also a couple of other bits and bobs:

Extras
------

jsonify templatetag
~~~~~~~~~~~~~~~~~~~
This allows you to convert a python data structure into JSON within a template::

    {% load jsonify %}
    
    <script>
    var foo = {{ bar|jsonify }};
    </script>
  
History
----------
0.8.2
~~~~~
Oops. Packaging error prevented install from pypi. Added README.rst to manifest.


0.8.1
~~~~~
Converting to string does nothing, as serializing a model instance with a JSONField would have a string version of that field, instead of it embedded inline. (Back to pre 0.8 behaviour).

Added better querying support: (``field__contains={'key':'value','key2':'value2'}`` works.)

Removed JSONTableWidget from package.

0.8
~~~
(Many thanks to `IanLewis`_ for these features)

Supports django 1.2

Supports callable and json serializable objects as default

Implemented get_db_prep_value()

Add tests and test runner.

Removed JSONTableWidget from README.

0.7.1
~~~~~
Don't fail when trying to install before django is installed.

0.7
~~~
First time I tagged releases.


Todo
----------
Convert date/time objects nicely to/from ISO strings (YYYY-mm-dd HH:MM:SS 
TZNAME). This is actually a bit tricky, as we don't know if we are expecting
a date/time object. We may parse objects as we go, but there could be
some performance issues with this.

.. _David Cramer's blog: http://justcramer.com/2009/04/14/cleaning-up-with-json-and-sql/
.. _IanLewis: https://bitbucket.org/IanLewis
