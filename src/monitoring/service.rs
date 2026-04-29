use sysinfo::{CpuRefreshKind, MemoryRefreshKind, RefreshKind, System, ProcessRefreshKind};
use serde::Serialize;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use tracing::Subscriber;
use tracing_subscriber::Layer;
use tokio::sync::broadcast;

#[derive(Serialize, utoipa::ToSchema, Clone, Debug)]
pub struct ProcessStats {
    pub name: String,
    pub memory_used: u64,
    pub cpu_usage: f32,
    pub is_system: bool,
}

#[derive(Serialize, utoipa::ToSchema, Clone, Debug)]
pub struct SystemStats {
    pub cpu_usage: f32,
    pub memory_used: u64,
    pub memory_total: u64,
    pub uptime: u64,
    pub processes: Vec<ProcessStats>,
}

static SYSTEM: Lazy<Mutex<System>> = Lazy::new(|| {
    Mutex::new(System::new_with_specifics(
        RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::nothing().with_cpu_usage())
            .with_memory(MemoryRefreshKind::nothing().with_ram())
            .with_processes(
                ProcessRefreshKind::nothing()
                    .with_cpu()
                    .with_memory()
                    .with_cwd(sysinfo::UpdateKind::Always)
                    .with_cmd(sysinfo::UpdateKind::Always),
            ),
    ))
});

pub fn get_system_stats(mfes: Vec<(String, String)>) -> SystemStats {
    let mut sys = SYSTEM.lock().unwrap();
    sys.refresh_cpu_all();
    sys.refresh_memory();
    sys.refresh_processes_specifics(
        sysinfo::ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::nothing()
            .with_cpu()
            .with_memory()
            .with_cwd(sysinfo::UpdateKind::Always)
            .with_cmd(sysinfo::UpdateKind::Always),
    );

    let mut processes = Vec::new();

    // Add main backend process
    if let Some(process) = sys.process(sysinfo::get_current_pid().unwrap()) {
        let cpu = process.cpu_usage();
        processes.push(ProcessStats {
            name: "Main Backend".to_string(),
            memory_used: process.memory(),
            cpu_usage: if cpu.is_nan() || cpu.is_infinite() { 0.0 } else { cpu },
            is_system: true,
        });
    }

    // Try to find MFE processes
    // We look for node processes that have specific keywords in their command line or working directory
    for process in sys.processes().values() {
        let cmd = process.cmd().iter().map(|s| s.to_string_lossy()).collect::<Vec<_>>().join(" ");
        let cwd = process.cwd().map(|p| p.to_string_lossy().to_string()).unwrap_or_default();
        let search_text = format!("{} {}", cmd, cwd).to_lowercase();

        let mut matched_name = None;

        // Dynamic discovery from DB
        for (mfe_name, display_name) in &mfes {
            let keyword = format!("admin-{}", mfe_name);
            if search_text.contains(&keyword) || search_text.contains(mfe_name) {
                matched_name = Some(display_name.clone());
                break;
            }
        }

        if let Some(mfe_name) = matched_name {
            // Avoid duplicates (sometimes there are multiple processes per app in dev)
            if !processes.iter().any(|p| p.name == mfe_name) {
                let cpu = process.cpu_usage();
                processes.push(ProcessStats {
                    name: mfe_name.to_string(),
                    memory_used: process.memory(),
                    cpu_usage: if cpu.is_nan() || cpu.is_infinite() { 0.0 } else { cpu },
                    is_system: false,
                });
            }
        }
    }

    let global_cpu = sys.global_cpu_usage();
    SystemStats {
        cpu_usage: if global_cpu.is_nan() || global_cpu.is_infinite() { 0.0 } else { global_cpu },
        memory_used: sys.used_memory(),
        memory_total: sys.total_memory(),
        uptime: System::uptime(),
        processes,
    }
}

pub struct LogBroadcastLayer {
    pub tx: broadcast::Sender<String>,
}

impl<S> Layer<S> for LogBroadcastLayer
where
    S: Subscriber,
{
    fn on_event(
        &self,
        event: &tracing::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let mut visitor = LogVisitor::new();
        event.record(&mut visitor);
        let _ = self.tx.send(visitor.message);
    }
}

struct LogVisitor {
    message: String,
}

impl LogVisitor {
    fn new() -> Self {
        Self { message: String::new() }
    }
}

impl tracing::field::Visit for LogVisitor {
    fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
        if field.name() == "message" {
            self.message = format!("{:?}", value);
        }
    }
}
