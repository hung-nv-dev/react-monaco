import { useState } from "react";
import { Button, Card, Space } from "antd";
import { SOCQueryEditor } from "./components/soc-query-editor";
import "./App.css";

const SOC_EXAMPLE_QUERIES = [
  {
    name: "Web Attack Detection (UC01)",
    query: `SELECT *
WHERE dest_url ~ "(?i)(\\.\\.[\\\\/]|union\\s+select|<script|exec\\s*\\()"
  AND timestamp >= relative_time(now(), "-7d")
|last 100`,
  },
  {
    name: "VirusTotal File Hash Check (UC02)",
    query: `SELECT file_hash, source_process_path, timestamp
WHERE file_hash != NULL
  AND hash_check_virustotal(file_hash) = "malicious"
  AND timestamp >= relative_time(now(), "-24h")
|dedup file_hash`,
  },
  {
    name: "PowerShell Suspicious Commands (UC03)",
    query: `SELECT EventID, source_process_path, source_process_command_line, timestamp
WHERE EventID = 4688
  AND source_process_path ~ "(?i)powershell\\.exe$"
  AND source_process_command_line ~ "(?i)(encodedcommand|bypass|hidden)"
|order by timestamp desc`,
  },
  {
    name: "Lateral Movement Detection (UC04)",
    query: `SELECT src_ip, dest_ip, dest_port, timestamp
WHERE dest_port IN (445, 135, 3389, 5985, 5986)
  AND src_ip != dest_ip
  AND timestamp >= relative_time(now(), "-1d")
|agg count() by src_ip, dest_ip
|order by count desc`,
  },
  {
    name: "Failed Login Attempts",
    query: `SELECT src_ip, username, timestamp
WHERE EventID = 4625
  AND timestamp >= relative_time(now(), "-24h")
|agg count() as failed_logins by src_ip, username
|order by failed_logins desc`,
  },
];

function App() {
  const [query, setQuery] = useState("");

  const loadExample = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div style={{ padding: "16px", maxWidth: "100%" }}>
      <SOCQueryEditor
        value={query}
        onChange={setQuery}
        placeholder="Enter your query here..."
      />

      <Card
        title="Example Queries"
        size="small"
        style={{ marginTop: 16 }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {SOC_EXAMPLE_QUERIES.map((example, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              <Button
                type="link"
                onClick={() => loadExample(example.query)}
                style={{
                  padding: 0,
                  height: "auto",
                  textAlign: "left",
                  fontWeight: 500,
                }}
              >
                {example.name}
              </Button>
              <pre
                style={{
                  background: "#fafafa",
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 12,
                  marginTop: 4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {example.query}
              </pre>
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
}

export default App;
