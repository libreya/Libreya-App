# Here are your Instructions

## SQL

### Query for retrieving list of categories

```sql
create or replace function get_book_categories()
returns table(category text)
language sql
as $$
  select distinct category
  from books;
$$;
```

Usage on api.ts
```typescript
const { data, error } = await supabase.rpc('get_distinct_categories');
if (error) throw new Error(error.message);
    const formatted: string[] =
    data?.map((item: { category: string }) => item.category).sort((a: string, b: string) => a.localeCompare(b)) ?? [];
return formatted;
```


### Retrieve number of books per author

```sql
select author, count(*) as book_count
from books
group by author
order by book_count desc;
```
