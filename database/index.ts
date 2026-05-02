const DATABASE_DISABLED_MESSAGE =
  '[Vyra] La capa de base de datos fue eliminada temporalmente mientras se reconstruye.';
const DATABASE_LAYER_ENABLED = false;

function createDatabaseDisabledError(): Error {
  const error = new Error(DATABASE_DISABLED_MESSAGE);
  error.name = 'DatabaseDisabledError';
  return error;
}

type DisabledRecord = Record<string, unknown>;

interface DisabledQuery {
  fetch: <T = DisabledRecord>() => Promise<T[]>;
}

interface DisabledCollection {
  query: (..._args: unknown[]) => DisabledQuery;
  find: (_id: string) => Promise<never>;
  create: (_builder?: (record: DisabledRecord) => void) => Promise<never>;
}

interface DisabledDatabase {
  get: (_tableName: string) => DisabledCollection;
  write: (_work: () => Promise<unknown> | unknown) => Promise<never>;
}

const emptyQuery: DisabledQuery = {
  fetch: async <T = DisabledRecord>() => [] as T[],
};

const disabledCollection: DisabledCollection = {
  query: (..._args) => emptyQuery,
  find: async (_id: string): Promise<never> => {
    throw createDatabaseDisabledError();
  },
  create: async (_builder?: (record: DisabledRecord) => void): Promise<never> => {
    throw createDatabaseDisabledError();
  },
};

const disabledDatabase: DisabledDatabase = {
  get: (_tableName: string) => disabledCollection,
  write: async (_work: () => Promise<unknown> | unknown): Promise<never> => {
    throw createDatabaseDisabledError();
  },
};

export function getAdapter(): null {
  return null;
}

export function isDatabaseLayerEnabled(): boolean {
  return DATABASE_LAYER_ENABLED;
}

export function getDatabase(): DisabledDatabase {
  return disabledDatabase;
}

export async function syncPendingChanges(): Promise<{ synced: number; failed: number }> {
  return { synced: 0, failed: 0 };
}

export async function enqueueSync(
  _tableName: string,
  _operation: 'insert' | 'update' | 'delete',
  _recordId: string,
  _payload: Record<string, unknown>,
  _serverId?: string,
): Promise<void> {
  throw createDatabaseDisabledError();
}

export async function writeLocalAndSync<T extends { id: string }>(
  _tableName: string,
  _data: Record<string, unknown>,
  _userId: string,
  _syncPayload?: Record<string, unknown>,
): Promise<string> {
  throw createDatabaseDisabledError();
}

export const adapter = getAdapter();
export const database = getDatabase();

export default database;
