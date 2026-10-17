# TalentPilot AI — Synthetic Test Resumes Suite

This folder contains **12 core engineering personas** and **4 edge-case resumes** built for end-to-end evaluation, testing, and demonstration of the TalentPilot AI recruitment platform.

All candidate profiles use the standardized evaluation inbox:
**`abhinavclouds@gmail.com`**

---

## 1. Primary Personas (12)

| File Prefix | Candidate Name | Primary Role & Specialization | Key Skills |
|---|---|---|---|
| `01_Senior_Cloud_DevOps_Engineer` | Abhinav Sharma | Staff / Senior Cloud DevOps | AWS, GCP, EKS, Terraform, ArgoCD, GitOps |
| `02_Junior_DevOps_Engineer` | Abhinav Patel | Junior DevOps Associate (2 yrs) | Docker, AWS, GitHub Actions, Linux, Bash |
| `03_Site_Reliability_Engineer_SRE` | Abhinav Rao | Senior SRE / Chaos Engineering | SLOs, Incident Response, Chaos Mesh, OTel |
| `04_Senior_Backend_Python_Engineer` | Abhinav Gupta | Senior Backend Systems Engineer | Python 3.12, FastAPI, AsyncIO, PostgreSQL, Redis |
| `05_FullStack_TypeScript_Product_Engineer` | Abhinav Kumar | Lead Full-Stack Product Engineer | React 19, TypeScript, Next.js, Tailwind, Playwright |
| `06_Principal_Data_Platform_Engineer` | Abhinav Verma | Principal Data & Streaming Lead | Apache Flink, Kafka, Snowflake, Spark, dbt |
| `07_Machine_Learning_Systems_Engineer` | Abhinav Cloud | Principal ML / LLM Platforms | PyTorch, vLLM, FlashAttention, CUDA, Qdrant |
| `08_Cloud_Security_ZeroTrust_Lead` | Abhinav S. | Cloud Security & Zero-Trust Lead | Vault, Istio mTLS, IAM, SOC2 Type II, Trivy |
| `09_Kubernetes_Platform_Engineer` | Abhinav Joshi | Staff Kubernetes Platform Engineer | Go, Kubebuilder CRDs, Cilium eBPF, ArgoCD |
| `10_Senior_QA_Automation_Engineer` | Abhinav Singh | Senior QA Automation Lead | Playwright, Cypress, Pytest, k6 Load Testing |
| `11_Infrastructure_Terraform_Specialist` | Abhinav Choudhury | Senior Infrastructure Specialist | Terraform, Terragrunt, OpenTofu, OPA Policy |
| `12_Career_Transition_Associate_Cloud_Engineer` | Abhinav N. | Associate Cloud Engineer (Transition) | AWS Lambda, Python, Docker, CloudWatch |

---

## 2. Edge-Case Resumes (`edge-cases/`)

| File Prefix | Edge Case Type | Purpose in Testing |
|---|---|---|
| `01_Minimalist_Sparse_Resume` | Ultra-sparse profile | Tests AI handling of brief candidate profiles with minimal work history. |
| `02_Verbose_Executive_Resume` | 16+ year VP Executive | Tests handling of high-level management claims, budgets, and large teams. |
| `03_Special_Characters_Unicode_Resume` | Unicode & Accented Characters | Tests UTF-8 / non-ASCII character encoding and sanitization. |
| `04_Formatting_Quirks_Resume` | Non-standard layout / consulting | Tests flexible parsing of atypical resume layouts and multiple contracts. |

---

## How to Test with These Resumes

1. Open the **TalentPilot AI Recruiter Command Center** (`http://localhost:8000/admin`).
2. Navigate to **Candidate Pipeline** (`/admin/candidates`).
3. Click **Add Candidate with Resume**.
4. Drag and drop any PDF or TXT resume from this folder.
5. The system will:
   - Extract candidate name, title, summary, and skills automatically via AI Document Parsing.
   - Attach the candidate to the active campaign.
   - Generate a unique SHA-256 cryptographic interview invitation link.
   - Dispatch a personalized invitation email with credentials to `abhinavclouds@gmail.com`.
