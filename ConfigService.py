# Identify the parent ID and assign it to the newrep variable.
newrep = AdminConfig.getid('/ResourceEnvironmentProvider:WP ConfigService/')
print newrep

# Identify the required attributes
print AdminConfig.required('J2EEResourceProperty')

# Identify all possible attributes
print AdminConfig.attributes('J2EEResourceProperty')

# Set up the required attributes and assign it to a variable:
name01 = ['name','friendly.redirect.enabled']
val01 = ['value', 'false']

rpAttrs01 = [ name01, val01 ]

# Get the J2EE resource property set:
propSet = AdminConfig.showAttribute(newrep, 'propertySet')
print propSet

# Create a J2EE resource property:
print AdminConfig.create('J2EEResourceProperty', propSet, rpAttrs01)

# Save the configuration changes:
AdminConfig.save()