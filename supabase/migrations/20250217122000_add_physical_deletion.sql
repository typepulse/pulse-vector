-- Create function for physically deleting documents
create or replace function physically_delete_documents(document_ids bigint[])
returns void
language plpgsql
security definer
as $$
begin
    -- Perform deletion in a transaction to ensure atomicity
    -- This ensures either all operations succeed or none do
    delete from documents
    where id = any(document_ids)
    and deleted_at is not null;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function physically_delete_documents(bigint[]) to authenticated;

-- Add index to improve deletion performance
create index if not exists idx_documents_deleted_at
    on documents(deleted_at)
    where deleted_at is not null; 