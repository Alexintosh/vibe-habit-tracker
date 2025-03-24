// This is a utility file to load the SQLite WASM module

let sqlitePromiser: any = null;
let isLoading = false;
let isLoaded = false;
let loadError: Error | null = null;

// Define a custom loader for the SQLite WASM module
export async function initSqlite() {
  if (isLoaded) return sqlitePromiser;
  if (isLoading) {
    // Wait for loading to complete
    return new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (isLoaded) resolve(sqlitePromiser);
        else if (loadError) reject(loadError);
        else setTimeout(checkLoaded, 100);
      };
      checkLoaded();
    });
  }

  isLoading = true;
  
  try {
    // Import the sqlite3Worker1Promiser as recommended in the docs
    const url = '/sqlite-wasm/sqlite3-worker1-promiser.js';
    
    // Import the worker promiser
    const { sqlite3Worker1Promiser } = await import(/* webpackIgnore: true */ url);
    
    // Initialize with the worker pattern
    sqlitePromiser = await new Promise((resolve) => {
      const promiser = sqlite3Worker1Promiser({
        onready: () => resolve(promiser),
        // Configure worker and wasm paths
        workerUrl: '/sqlite-wasm/sqlite3-worker1.js',
        wasmUrl: '/sqlite-wasm/sqlite3.wasm'
      });
    });
    
    // Get config to confirm it's working
    const configResponse = await sqlitePromiser('config-get', {});
    console.log('SQLite loaded:', configResponse.result.version.libVersion);
    
    isLoaded = true;
    isLoading = false;
    
    return sqlitePromiser;
  } catch (error: any) {
    console.error('Failed to load SQLite WASM module:', error);
    loadError = error;
    isLoading = false;
    throw error;
  }
}

// Create a database connection from an ArrayBuffer
export async function createDbConnection(arrayBuffer: ArrayBuffer) {
  try {
    // Get the SQLite worker promiser
    const promiser = await initSqlite();
    
    // First, open a new temporary database
    const openResponse = await promiser('open', {
      filename: ':memory:',
      flags: 'c',
    });
    
    const dbId = openResponse.result.dbId;
    
    // Convert the ArrayBuffer to chunks of bytes if necessary
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Create a Blob URL from the array buffer
    const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(blob);
    
    try {
      // Use the DB-load-from-URL command
      const loadResponse = await promiser('db-load-from-url', {
        dbId,
        url: blobUrl
      });
      
      console.log('Database loaded from URL');
    } catch (loadError) {
      console.error('Error loading from URL:', loadError);
      
      // If direct URL loading fails, close the DB and try a different approach
      await promiser('close', { dbId });
      
      // Try opening directly with the URL (some versions support this)
      try {
        const reopenResponse = await promiser('open', {
          filename: blobUrl,
          flags: 'r',
          vfs: 'kvvfs'
        });
        
        return { dbId: reopenResponse.result.dbId, promiser };
      } catch (reopenError) {
        console.error('Error reopening with URL:', reopenError);
        throw new Error('Unable to load the database file');
      }
    }
    
    return { dbId, promiser };
  } catch (error) {
    console.error('Error creating database connection:', error);
    throw error;
  }
}

// Query habits from a database
export async function queryHabits(db: { dbId: string, promiser: any }) {
  try {
    const { dbId, promiser } = db;
    
    // Execute query using the worker
    const response = await promiser('exec', {
      dbId,
      sql: "SELECT * FROM Habit ORDER BY `order` ASC, createdAt DESC",
      returnValue: 'resultRows',
      rowMode: 'object'
    });
    
    if (!response.result || !response.result.resultRows) {
      return [];
    }
    
    // Process the results
    return response.result.resultRows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      frequency: row.frequency,
      goal: row.goal,
      color: row.color,
      emoji: row.emoji || '✨',
      category: row.category || 'OTHER',
      order: row.order || 0,
      createdAt: row.createdAt
    }));
  } catch (error) {
    console.error('Error querying habits:', error);
    return [];
  }
} 