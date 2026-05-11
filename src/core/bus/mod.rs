use serde::{Serialize, Deserialize};
use tokio::sync::broadcast;

#[derive(Serialize, Deserialize, Clone, Debug, utoipa::ToSchema)]
#[serde(tag = "type", content = "payload")]
pub enum SystemEvent {
    FileProcessed { id: String, path: String },
    ContentUpdated { id: String, schema: String },
    ContentLocked { id: String, user_id: String },
    ConfigChanged { key: String },
}

#[derive(Debug)]
pub struct RealtimeBus {
    tx: broadcast::Sender<SystemEvent>,
}

impl RealtimeBus {
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }

    pub fn publish(&self, event: SystemEvent) {
        let _ = self.tx.send(event);
    }

    pub fn subscribe(&self) -> broadcast::Receiver<SystemEvent> {
        self.tx.subscribe()
    }
}
