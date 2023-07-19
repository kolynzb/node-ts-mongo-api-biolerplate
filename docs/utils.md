## filterObj
The filterObj function takes an object obj and a variable number of arguments allowedFields representing the names of fields that are allowed to be included in the returned object.

The function iterates through all the keys of the input object using Object.keys(), and if the key is included in the allowedFields argument, it adds the key-value pair to a new object newObj. Finally, the function returns the filtered newObj.

The returned object contains only the fields that are specified in the allowedFields argument, and any other fields in the input object are ignored.

The usage example shows how to filter out unwanted fields from the request body, by passing the request body as the first argument and a list of allowed field names as the remaining arguments. The filtered object is then stored in the filteredBody variable
