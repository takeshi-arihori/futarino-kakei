// モック版のSupabaseクライアント（開発用）

export const mockSupabase = {
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      or: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: {
              id: 'mock-id',
              invite_code: 'MOCK1234',
              name: 'モックカップル',
            },
            error: null,
          }),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'mock-id', status: 'active' },
              error: null,
            }),
        }),
      }),
    }),
  }),
  rpc: (functionName: string) => {
    if (functionName === 'generate_invite_code') {
      return Promise.resolve({ data: 'MOCK1234', error: null });
    }
    return Promise.resolve({ data: null, error: null });
  },
};
