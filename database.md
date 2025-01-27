# Database Tables for SisVentas
These are the tables o create for every implementation of the SisVentas application.
## Common Tables for All Implementations
### 1. Users
- Stores user information for authentication and authorization
- Fields: id(Text), email(Text), password(Text), tier(Text)

### 2. Clients (clients)
- Stores information about clients
- Fields: id(Text), name(Text), prices(Text)

### 3. Products (products)
- Stores information about products
- Fields: id(Text), name (Text), genericprice(Number)

### 4. Bills (bills)
- Stores information about sales receipts
- Fields: id(Text), clientid(Text), products (JSON), date (Text), identifier (Text)

### 5. Deposits (deposits)
- Stores information about client deposits
- Fields: id(Text), clientid(Text), currency (Text), changueamount (Number), amount (Number), operationcode (Text), identifier (Text), date (Text)

## Implementation-specific Considerations

### JSON Implementation
- For the JSON implementation, these "tables" will be represented as arrays of objects within a JSON file or in-memory data structure.

### MySQL Implementation
- Create tables using SQL CREATE TABLE statements
- Use appropriate data types (e.g., INT for IDs, VARCHAR for names, DECIMAL for prices, DATETIME for dates)
- Consider using JSON data type for \`products\` in Bills and \`prices\` in Clients

### PostgreSQL Implementation
- Similar to MySQL, but use PostgreSQL-specific data types where appropriate
- Use JSONB data type for \`products\` in Bills and \`prices\` in Clients for better performance with JSON data

### Supabase Implementation
- Create tables using Supabase interface or SQL statements
- Leverage Supabase's built-in authentication for the Users table
- Use appropriate data types, similar to PostgreSQL
- Consider using Supabase's realtime features for live updates

## Additional Considerations

- Implement proper indexing on frequently queried fields (e.g., clientid, date)
- Set up foreign key constraints where appropriate (e.g., clientid in Bills and Deposits referencing id in Clients)
- Consider adding timestamps (created_at, updated_at) to tables for auditing purposes
- Implement proper access control policies, especially in Supabase, to restrict data access based on user tiers

