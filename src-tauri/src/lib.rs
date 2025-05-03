use odbc_api::{buffers::TextRowSet, Connection, ConnectionOptions, Cursor, Environment, ResultSetMetadata};
use tauri::async_runtime::Mutex;


struct Database {
  env: Environment,
  connection_string: String
}

impl Database {
  pub fn execute(&self, query: &str) -> anyhow::Result<String> {
    let conn = self.connect()?;

    let x = match conn.execute(query, (), None)? {
        Some(mut cursor) => {
          let mut out_lines: Vec<String> = Vec::new();

          let headline = cursor.column_names()?.filter_map(|c| c.ok()).collect::<Vec<_>>().join(";");
          out_lines.push(headline);

          let mut buffers = TextRowSet::for_cursor(256, &mut cursor, Some(1024))?;
          let mut row_set_cursor = cursor.bind_buffer(&mut buffers)?;

          while let Some(batch) = row_set_cursor.fetch()? {
            for r in 0..batch.num_rows() {
              let record = (0..batch.num_cols())
                .filter_map(|c| {
                  batch.at_as_str(c, r).ok()
                })
                .filter_map(|s| s)
                .collect::<Vec<_>>()
                .join(";");
              out_lines.push(record);
            }
          }

          Ok(out_lines.join("\n"))
        },
        None => {
          Ok(String::from("Query executed successfully."))
        },
    }; x
  }

  pub fn test_connection(&self) -> anyhow::Result<()> {
    self.env.connect_with_connection_string(&self.connection_string, ConnectionOptions::default())?;
    Ok(())
  }


  fn connect(&self) -> anyhow::Result<Connection<'_>> {
    Ok(self.env.connect_with_connection_string(&self.connection_string, ConnectionOptions::default())?)
  }
}



#[derive(Default)]
struct AppState {
  db: Option<Database>
}

impl AppState {
  pub fn odbc_drivers() -> anyhow::Result<Vec<String>> {
    let env = Environment::new()?;
    let driver_names = env.drivers()?
      .into_iter()
      .map(|d| d.description)
      .collect::<Vec<_>>();
    Ok(driver_names)
  }

  pub fn db_connect(&mut self, conn_string: String) -> anyhow::Result<()> {
    let env = Environment::new()?;
    let db = Database {
      env,
      connection_string: conn_string
    };

    db.test_connection()?;
    self.db = Some(db);

    Ok(())
  }

  pub fn db_connected(&self) -> anyhow::Result<bool> {
    if let Some(db) = self.db.as_ref() {
      db.test_connection()?;
      Ok(true)
    } else {
      Ok(false)
    }
  }

  pub fn db_execute(&self, query: &str) -> anyhow::Result<String> {
    self.db.as_ref()
      .ok_or(anyhow::anyhow!("Not connected to database"))?
      .execute(query)
  }

  pub fn db_disconnect(&mut self) -> anyhow::Result<()> {
    self.db = None;
    Ok(())
  }
}



#[tauri::command]
async fn odbc_drivers() -> Result<Vec<String>, String> {
  AppState::odbc_drivers().map_err(|e| e.to_string())
}

#[tauri::command]
async fn db_connect(
  app: tauri::State<'_, Mutex<AppState>>,
  conn_string: String, 
) -> Result<(), String> {
  let mut app_lock = app.lock().await;
  app_lock.db_connect(conn_string).map_err(|e| e.to_string())
}

// TODO replace with function returning metadata (like DB kind)
#[tauri::command]
async fn db_connected(app: tauri::State<'_, Mutex<AppState>>) -> Result<bool, String> {
  let app_lock = app.lock().await;
  app_lock.db_connected().map_err(|e| e.to_string())
}

#[tauri::command]
async fn db_execute(query: String, app: tauri::State<'_, Mutex<AppState>>) -> Result<String, String> {
  let app_lock = app.lock().await;
  app_lock.db_execute(&query).map_err(|e| e.to_string())
}

#[tauri::command]
async fn db_disconnect(app: tauri::State<'_, Mutex<AppState>>) -> Result<(), String> {
  let mut app_lock = app.lock().await;
  app_lock.db_disconnect().map_err(|e| e.to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .manage(Mutex::new(AppState::default()))
    .invoke_handler(tauri::generate_handler![
      odbc_drivers,
      db_connect,
      db_connected,
      db_execute,
      db_disconnect
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
