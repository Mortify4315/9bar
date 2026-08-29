use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

const DEFAULT_BASE_URL: &str = "http://localhost:20128";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConnection {
    pub id: String,
    pub provider: String,
    #[serde(rename = "authType", default)]
    pub auth_type: Option<String>,
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub email: Option<String>,
    #[serde(default)]
    pub priority: Option<i32>,
    #[serde(rename = "isActive", default)]
    pub is_active: bool,
    #[serde(rename = "testStatus", default)]
    pub test_status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProvidersResponse {
    #[serde(default)]
    pub connections: Vec<ProviderConnection>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotaDetail {
    #[serde(default)]
    pub used: Option<f64>,
    #[serde(default)]
    pub total: Option<f64>,
    #[serde(default)]
    pub remaining: Option<f64>,
    #[serde(rename = "resetAt", default)]
    pub reset_at: Option<String>,
    #[serde(default)]
    pub unlimited: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResetCredits {
    #[serde(rename = "availableCount", default)]
    pub available_count: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotaUsageResponse {
    #[serde(default)]
    pub plan: Option<String>,
    #[serde(rename = "limitReached", default)]
    pub limit_reached: Option<bool>,
    #[serde(rename = "resetCredits", default)]
    pub reset_credits: Option<ResetCredits>,
    #[serde(default)]
    pub quotas: Option<HashMap<String, QuotaDetail>>,
    #[serde(default)]
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountQuotaView {
    pub id: String,
    pub provider: String,
    pub name: String,
    pub email: String,
    pub is_active: bool,
    pub test_status: String,
    pub plan: Option<String>,
    pub limit_reached: bool,
    pub reset_credits_available: i32,
    pub session_quota: Option<QuotaDetail>,
    pub weekly_quota: Option<QuotaDetail>,
    pub quotas: HashMap<String, QuotaDetail>,
    pub error: Option<String>,
}

pub struct RouterClient {
    base_url: String,
    http: Client,
}

impl RouterClient {
    pub fn new(base_url: Option<String>) -> Self {
        let base = base_url.unwrap_or_else(|| DEFAULT_BASE_URL.to_string());
        let http = Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .unwrap_or_default();
        Self {
            base_url: base,
            http,
        }
    }

    pub async fn fetch_providers(&self) -> Result<Vec<ProviderConnection>, String> {
        let url = format!("{}/api/providers/client?pageSize=100", self.base_url);
        let resp = self
            .http
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("Server returned HTTP {}", resp.status()));
        }

        let body: ProvidersResponse = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse providers JSON: {}", e))?;

        Ok(body.connections)
    }

    pub async fn fetch_usage(&self, connection_id: &str) -> Result<QuotaUsageResponse, String> {
        let url = format!("{}/api/usage/{}", self.base_url, connection_id);
        let resp = self
            .http
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("Server returned HTTP {}", resp.status()));
        }

        let body: QuotaUsageResponse = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse usage JSON: {}", e))?;

        Ok(body)
    }

    pub async fn fetch_all_quotas(&self) -> Result<Vec<AccountQuotaView>, String> {
        let connections = self.fetch_providers().await?;
        let mut results = Vec::new();

        // Fetch usage for all providers concurrently
        let mut tasks = Vec::new();
        for conn in connections {
            let client_clone = self.clone_client();
            tasks.push(tokio::spawn(async move {
                let usage_res = client_clone.fetch_usage(&conn.id).await;
                (conn, usage_res)
            }));
        }

        for task in tasks {
            if let Ok((conn, usage_res)) = task.await {
                let name = conn.name.clone().unwrap_or_else(|| "Unnamed".to_string());
                let email = conn.email.clone().unwrap_or_else(|| name.clone());
                let test_status = conn.test_status.clone().unwrap_or_else(|| "unknown".to_string());

                match usage_res {
                    Ok(usage) => {
                        let mut session_quota = None;
                        let mut weekly_quota = None;
                        let quotas_map = usage.quotas.clone().unwrap_or_default();

                        if let Some(sq) = quotas_map.get("session") {
                            session_quota = Some(sq.clone());
                        }
                        if let Some(wq) = quotas_map.get("weekly") {
                            weekly_quota = Some(wq.clone());
                        }

                        let reset_credits_count = usage
                            .reset_credits
                            .and_then(|rc| rc.available_count)
                            .unwrap_or(0);

                        results.push(AccountQuotaView {
                            id: conn.id,
                            provider: conn.provider,
                            name,
                            email,
                            is_active: conn.is_active,
                            test_status,
                            plan: usage.plan,
                            limit_reached: usage.limit_reached.unwrap_or(false),
                            reset_credits_available: reset_credits_count,
                            session_quota,
                            weekly_quota,
                            quotas: quotas_map,
                            error: None,
                        });
                    }
                    Err(e) => {
                        results.push(AccountQuotaView {
                            id: conn.id,
                            provider: conn.provider,
                            name,
                            email,
                            is_active: conn.is_active,
                            test_status,
                            plan: None,
                            limit_reached: false,
                            reset_credits_available: 0,
                            session_quota: None,
                            weekly_quota: None,
                            quotas: HashMap::new(),
                            error: Some(e),
                        });
                    }
                }
            }
        }

        Ok(results)
    }

    fn clone_client(&self) -> Self {
        Self {
            base_url: self.base_url.clone(),
            http: self.http.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_usage_json() {
        let sample = r#"{
            "plan": "plus",
            "limitReached": false,
            "resetCredits": { "availableCount": 0 },
            "quotas": {
                "session": { "used": 21, "total": 100, "remaining": 79, "resetAt": "2026-08-29T08:13:09.000Z" },
                "weekly": { "used": 45, "total": 100, "remaining": 55, "resetAt": "2026-09-03T16:27:02.000Z" }
            }
        }"#;

        let usage: QuotaUsageResponse = serde_json::from_str(sample).expect("valid json");
        assert_eq!(usage.plan.as_deref(), Some("plus"));
        assert_eq!(usage.limit_reached, Some(false));
        let quotas = usage.quotas.unwrap();
        assert_eq!(quotas.get("session").unwrap().remaining, Some(79.0));
        assert_eq!(quotas.get("weekly").unwrap().remaining, Some(55.0));
    }
}
