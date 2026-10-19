export const unwrapExport = (statement) =>
  statement.type.startsWith('Export') && statement.declaration ? statement.declaration : statement
