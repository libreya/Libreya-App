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

Usage on api.ts (post)
```typescript
const { data, error } = await supabase.rpc('get_distinct_categories');
if (error) throw new Error(error.message);
    const formatted: string[] =
    data?.map((item: { category: string }) => item.category).sort((a: string, b: string) => a.localeCompare(b)) ?? [];
return formatted;
```

### Query for incrementing book read count
```sql
create or replace function increment_book_read(book_id_input int)
returns void
language sql
as $$
  update books
  set read_count = coalesce(read_count,0) + 1
  where id = book_id_input;
$$;
```

Usage on api.ts (post)
```typescript
 const match = endpoint.match(/^\/books\/(\d+)\/increment-read$/);

    if (match) {
      const bookId = Number(match[1]);
      const { error } = await supabase.rpc('increment_book_read', {
        book_id_input: bookId,
      });

      if (error) throw error;
      return { success: true };
    }
```

### Retrieve number of books per author

```sql
select author, count(*) as book_count
from books
group by author
order by book_count desc;
```
