import json

try:
    from django.db.models import Lookup, lookups
except ImportError:
    pass
else:
    
    from .utils import db_type
    
    def loads(params):
        for p in params:
            try:
                value = json.loads(p)
                if isinstance(value, basestring):
                    yield value
                else:
                    yield p
            except ValueError:
                yield p
    
    class HasKey(lookups.Contains):
        """
        If our connection is able to handle proper json (and our field is indeed
        an actual json object), then we can use the json_object_keys function,
        or equivalent.
    
        Otherwise, we'll need to be a bit tricky, and look for a string of the format:
    
        "keyname":
    
        (including the quotes).
    
        We probably won't get too many false positives. I hope.
        """
        lookup_name = 'has_key'
        
        def _as_sql(self, qn, connection):
            lhs, lhs_params = self.process_lhs(qn, connection)
            rhs, rhs_params = self.process_rhs(qn, connection)
            params = lhs_params + rhs_params
            
            if db_type(connection) == 'jsonb':
                return '%s ? %s' % (lhs, rhs), list(loads(params))
            
            return super(HasKey, self).as_sql(qn, connection)
        
        def get_rhs_op(self, connection, rhs):
            if db_type(connection) == 'jsonb':
                return '? %s' % rhs
            
            return connection.operators['contains'] % rhs

    class Contains(lookups.Contains):
        lookup_name = 'contains'
        
        def as_postgresql(self, qn, connection):
            lhs, lhs_params = self.process_lhs(qn, connection)
            rhs, rhs_params = self.process_rhs(qn, connection)
            params = lhs_params + rhs_params
            
            if db_type(connection) == 'jsonb':
                # urgh.
                lhs = lhs.replace('::text', '::jsonb')
                return '%s @> %s::jsonb' % (lhs, rhs), list(loads(params))
            
            return super(Contains, self).as_postgresql(qn, connection)
    
    class Exact(lookups.Exact):
        lookup_name = 'exact'
        
        def as_postgresql(self, qn, connection):
            lhs, lhs_params = self.process_lhs(qn, connection)
            rhs, rhs_params = self.process_rhs(qn, connection)
            params = lhs_params + rhs_params
            
            if db_type(connection) == 'jsonb':
                return '%s::jsonb = %s::jsonb' % (lhs, rhs), list(loads(params))
            
            return super(Contains, self).as_postgresql(qn, connection)
        

