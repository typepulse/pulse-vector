set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.physically_delete_documents(document_ids bigint[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM documents
    WHERE id = ANY(document_ids)
    AND deleted_at IS NOT NULL;
END;
$function$
;

