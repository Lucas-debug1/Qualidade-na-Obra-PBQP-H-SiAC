import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook genérico de CRUD para uma tabela do Supabase.
 * Mantém uma lista em memória sincronizada com o banco de dados
 * compartilhado (qualquer usuário, qualquer aparelho).
 */
export function useSupabaseTable<T extends { id: string }>(
  table: string,
  orderBy: string = 'created_at',
) {
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setError('');
      setRecords((data ?? []) as T[]);
    }
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (record: Partial<T>) => {
      const { data, error } = await supabase
        .from(table)
        .insert(record as never)
        .select()
        .single();
      if (error) {
        setError(error.message);
        return null;
      }
      setRecords((v) => [data as T, ...v]);
      return data as T;
    },
    [table],
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      const { data, error } = await supabase
        .from(table)
        .update(patch as never)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        setError(error.message);
        return null;
      }
      setRecords((v) => v.map((r) => (r.id === id ? (data as T) : r)));
      return data as T;
    },
    [table],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        setError(error.message);
        return false;
      }
      setRecords((v) => v.filter((r) => r.id !== id));
      return true;
    },
    [table],
  );

  return { records, loading, error, reload, create, update, remove };
}
