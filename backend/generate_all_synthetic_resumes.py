import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

EMAIL = "abhinavclouds@gmail.com"

# Target directories
DIRS = [
    Path(r"c:\Users\abhin\Videos\aihack4\resumes"),
    Path(r"c:\Users\abhin\Videos\aihack4\test-data\resumes")
]

for d in DIRS:
    d.mkdir(parents=True, exist_ok=True)
    (d / "edge-cases").mkdir(parents=True, exist_ok=True)

personas = [
    {
        "id": "01_Senior_Cloud_DevOps_Engineer",
        "name": "Abhinav Sharma",
        "title": "Senior Cloud DevOps Engineer",
        "phone": "+1 (555) 721-8890",
        "email": EMAIL,
        "location": "San Francisco, CA (Remote)",
        "summary": "Senior Cloud DevOps Engineer with 8+ years designing high-availability multi-region cloud infrastructures on AWS and GCP. Expert in Infrastructure as Code (Terraform), Kubernetes cluster orchestration, zero-downtime deployment strategies, and enterprise GitOps with ArgoCD.",
        "skills": ["AWS", "GCP", "Kubernetes", "Docker", "Terraform", "ArgoCD", "GitHub Actions", "Prometheus", "Grafana", "Helm", "Python", "Bash", "Linux Internals"],
        "experience": [
            {
                "role": "Staff Cloud Infrastructure & DevOps Lead",
                "company": "CloudScale Platforms Inc.",
                "period": "2022 - Present",
                "bullets": [
                    "Architected multi-region AWS EKS Kubernetes clusters serving 120M daily API requests with 99.99% uptime SLA.",
                    "Automated end-to-end GitOps deployment pipelines using ArgoCD and GitHub Actions, cutting release cycles from 4 hours to 8 minutes.",
                    "Reduced monthly AWS infrastructure spend by 34% ($48,000/mo) through spot instance optimization and Karpenter auto-scaling.",
                    "Engineered multi-region disaster recovery replication with Route 53 latency routing and cross-region Aurora PostgreSQL failover."
                ]
            },
            {
                "role": "Senior DevOps Engineer",
                "company": "Vanguard Cloud Systems",
                "period": "2018 - 2022",
                "bullets": [
                    "Migrated 40+ containerized microservices from legacy on-premise hardware to Google Cloud Platform (GKE).",
                    "Authored reusable Terraform modules adopted across 12 product engineering teams for compliant cloud provisioning.",
                    "Implemented centralized logging and observability stacks utilizing Prometheus, Thanos, and Grafana Loki."
                ]
            }
        ],
        "education": "B.S. in Computer Science, Carnegie Mellon University (2018)"
    },
    {
        "id": "02_Junior_DevOps_Engineer",
        "name": "Abhinav Patel",
        "title": "Junior DevOps & Cloud Associate",
        "phone": "+1 (555) 314-5521",
        "email": EMAIL,
        "location": "Austin, TX (Hybrid)",
        "summary": "Enthusiastic Junior DevOps Engineer with 2 years of hands-on experience building CI/CD pipelines, containerizing applications with Docker, and assisting with cloud automation on AWS. Certified AWS Solutions Architect Associate.",
        "skills": ["Docker", "AWS (EC2, S3, RDS, IAM)", "GitHub Actions", "Linux / Bash Scripting", "Python", "Terraform Basics", "Kubernetes Fundamentals", "Git"],
        "experience": [
            {
                "role": "Associate DevOps Engineer",
                "company": "NextGen Web Solutions",
                "period": "2024 - Present",
                "bullets": [
                    "Automated build and test workflows in GitHub Actions for 8 Python FastAPI and Node.js repositories.",
                    "Containerized multi-tier web applications using multi-stage Dockerfiles, reducing average image size by 65%.",
                    "Configured AWS CloudWatch alerts and PagerDuty routing to monitor production API endpoints.",
                    "Created Bash automation scripts to streamline developer onboarding and local environment setup."
                ]
            },
            {
                "role": "Cloud Operations Intern",
                "company": "Apex Cloud Labs",
                "period": "2023 - 2024",
                "bullets": [
                    "Monitored staging and production infrastructure health, assisting senior engineers during triage.",
                    "Assisted in maintaining Terraform state files and writing basic security group and VPC configurations."
                ]
            }
        ],
        "education": "B.S. in Information Technology, University of Texas at Dallas (2023)"
    },
    {
        "id": "03_Site_Reliability_Engineer_SRE",
        "name": "Abhinav Rao",
        "title": "Senior Site Reliability Engineer (SRE)",
        "phone": "+1 (555) 902-4418",
        "email": EMAIL,
        "location": "Seattle, WA (Remote)",
        "summary": "Principal Site Reliability Engineer with 7+ years optimizing system resilience, defining SLOs/SLIs, and leading incident response for mission-critical enterprise systems. Passionate about chaos engineering and reducing operational toil through automated remediation.",
        "skills": ["SLO / SLI Design", "Incident Management", "Chaos Engineering", "Python", "Go", "OpenTelemetry", "Datadog", "Prometheus", "Kubernetes", "Linux Kernel Tuning", "eBPF"],
        "experience": [
            {
                "role": "Senior SRE / Observability Lead",
                "company": "HyperScale Fintech",
                "period": "2021 - Present",
                "bullets": [
                    "Formulated and implemented company-wide SLO/SLI error budget frameworks across 35 microservices.",
                    "Conducted monthly chaos engineering game days (Chaos Mesh / Gremlin) to validate automated failover resilience.",
                    "Engineered automated remediation bot in Python that resolved 42% of recurring alerts without human paging.",
                    "Spearheaded distributed tracing rollout using OpenTelemetry and Datadog, cutting mean time to detect (MTTD) by 60%."
                ]
            },
            {
                "role": "Systems Reliability Engineer",
                "company": "Streamline Networks",
                "period": "2018 - 2021",
                "bullets": [
                    "Managed 24/7 on-call rotation for distributed streaming platforms with strict 99.995% reliability requirements.",
                    "Optimized Linux TCP/IP network kernel parameters to resolve high socket churn during flash traffic spikes."
                ]
            }
        ],
        "education": "B.S. in Computer Systems Engineering, University of Washington (2018)"
    },
    {
        "id": "04_Senior_Backend_Python_Engineer",
        "name": "Abhinav Gupta",
        "title": "Senior Backend Systems Engineer (Python)",
        "phone": "+1 (555) 441-2390",
        "email": EMAIL,
        "location": "New York, NY (Remote)",
        "summary": "Senior Backend Engineer with 8 years mastering asynchronous Python (FastAPI, AsyncIO, Celery), PostgreSQL database internals, Redis caching, and distributed architecture. Proven history designing high-throughput APIs serving 50k+ requests per second.",
        "skills": ["Python 3.12", "FastAPI", "AsyncIO", "PostgreSQL", "SQLAlchemy", "Redis", "Celery", "Kafka", "Docker", "Pytest", "REST / gRPC", "System Architecture"],
        "experience": [
            {
                "role": "Staff Backend Engineer",
                "company": "Nexus Financial Core",
                "period": "2021 - Present",
                "bullets": [
                    "Engineered core ledger settlement API with Python FastAPI and PostgreSQL processing $12M daily transactions.",
                    "Optimized database connection pooling and query plans, reducing p99 API latency from 180ms to 24ms.",
                    "Constructed asynchronous task worker pipeline using Celery and Redis with distributed locking and idempotent retries.",
                    "Maintained 95%+ test coverage across 80,000 lines of Python code using Pytest and factory patterns."
                ]
            },
            {
                "role": "Backend Software Engineer",
                "company": "DataPoint Technologies",
                "period": "2017 - 2021",
                "bullets": [
                    "Designed RESTful microservices with Django and FastAPI supporting 500,000 mobile app users.",
                    "Implemented Redis cache layer with cache-aside and write-through strategies, slashing DB query load by 70%."
                ]
            }
        ],
        "education": "B.S. in Computer Science, Columbia University (2017)"
    },
    {
        "id": "05_FullStack_TypeScript_Product_Engineer",
        "name": "Abhinav Kumar",
        "title": "Lead Full-Stack Product Engineer",
        "phone": "+1 (555) 604-1234",
        "email": EMAIL,
        "location": "Boston, MA (Remote)",
        "summary": "Lead Full-Stack Product Engineer with 7+ years crafting responsive, accessible, and high-performance web applications using React, TypeScript, Next.js, Node.js, and Tailwind CSS. Obsessed with micro-interactions, WCAG 2.2 AA accessibility, and developer ergonomics.",
        "skills": ["TypeScript", "React 19", "Next.js", "Tailwind CSS", "Node.js", "FastAPI", "GraphQL", "Framer Motion", "Jest / Playwright", "Vite", "Zustand"],
        "experience": [
            {
                "role": "Lead Full-Stack Product Engineer",
                "company": "Lumina SaaS Studio",
                "period": "2021 - Present",
                "bullets": [
                    "Architected company flagship enterprise dashboard in React 19, TypeScript, and Tailwind CSS with sub-second page loads.",
                    "Engineered optimistic UI updates and real-time collaboration canvas via WebSockets, eliminating user data collisions.",
                    "Implemented WCAG 2.2 AA accessibility audit standards across 150+ UI components, achieving 100% keyboard accessibility.",
                    "Authored comprehensive end-to-end testing suite with Playwright and GitHub Actions CI running on every pull request."
                ]
            },
            {
                "role": "Full-Stack Engineer",
                "company": "CraftFlow Studio",
                "period": "2018 - 2021",
                "bullets": [
                    "Built customer-facing billing and checkout portal with React, Stripe Elements, and Node.js backend.",
                    "Migrated monolithic frontend codebase to modern TypeScript monorepo with Turborepo."
                ]
            }
        ],
        "education": "B.S. in Software Engineering, University of Michigan (2018)"
    },
    {
        "id": "06_Principal_Data_Platform_Engineer",
        "name": "Abhinav Verma",
        "title": "Principal Data Platform & Streaming Engineer",
        "phone": "+1 (555) 833-9012",
        "email": EMAIL,
        "location": "Chicago, IL (Remote)",
        "summary": "Principal Data Engineer with 9+ years architecting enterprise real-time streaming platforms, modern data stacks, and petabyte-scale analytical lakehouses. Expert in Apache Flink, Kafka, Snowflake, Spark, and dbt.",
        "skills": ["Apache Kafka", "Apache Flink", "Apache Spark", "Python", "SQL", "Snowflake", "dbt", "Airflow", "Delta Lake", "Data Modeling", "Streaming ETL", "Great Expectations"],
        "experience": [
            {
                "role": "Principal Data Platform Architect",
                "company": "Kinetix Data Systems",
                "period": "2022 - Present",
                "bullets": [
                    "Architected unified real-time streaming data ingestion engine processing 2.4 billion daily events using Apache Flink and Kafka.",
                    "Designed petabyte-scale Snowflake modern data warehouse and modular dbt transformation DAGs serving 500+ analytical users.",
                    "Built automated data quality observability platform with Great Expectations, preventing corrupt pipeline ingestion.",
                    "Optimized Snowflake warehouse sizing, query clustering keys, and materialized views, decreasing monthly compute costs by $45,000."
                ]
            },
            {
                "role": "Senior Data Infrastructure Engineer",
                "company": "OmniStream Analytics",
                "period": "2017 - 2022",
                "bullets": [
                    "Built batch and streaming ETL jobs in PySpark on AWS EMR processing 50TB daily logs.",
                    "Orchestrated complex enterprise workflow dependencies using Apache Airflow with custom sensors and SLA monitoring."
                ]
            }
        ],
        "education": "B.S. in Information Systems, University of Illinois Urbana-Champaign (2017)"
    },
    {
        "id": "07_Machine_Learning_Systems_Engineer",
        "name": "Abhinav Cloud",
        "title": "Principal ML Systems & LLM Platform Engineer",
        "phone": "+1 (555) 481-9920",
        "email": EMAIL,
        "location": "Seattle, WA (Remote)",
        "summary": "Machine Learning Systems Engineer specializing in high-throughput LLM serving infrastructure, multi-agent evaluation topologies, and GPU acceleration. Extensive experience deploying vLLM, FlashAttention, and Triton Inference Server at scale.",
        "skills": ["PyTorch", "vLLM", "FlashAttention", "Triton Server", "Python", "CUDA", "LangChain / LlamaIndex", "Vector DBs (Qdrant, Pinecone)", "Docker", "Kubernetes", "Ray"],
        "experience": [
            {
                "role": "Principal AI Platform Engineer",
                "company": "Synthetix AI Labs",
                "period": "2023 - Present",
                "bullets": [
                    "Spearheaded enterprise LLM cluster serving 80M daily tokens with vLLM and continuous batching on NVIDIA H100s, slashing p99 TTFT by 44%.",
                    "Architected specialized multi-agent evaluation orchestrator with bounded retries, structured JSON outputs, and adversarial critic validation.",
                    "Designed low-latency hybrid semantic search pipeline using Qdrant vector indexing and cross-encoder re-ranking handling 3,500 queries/sec.",
                    "Built prompt-injection defense shield sanitizing untrusted candidate documents and neutralizing delimiter hijack payloads."
                ]
            },
            {
                "role": "Senior ML Infrastructure Engineer",
                "company": "DeepVision Intelligence",
                "period": "2019 - 2023",
                "bullets": [
                    "Trained and fine-tuned domain-specific transformer models using PyTorch Distributed Data Parallel (DDP).",
                    "Optimized inference throughput by 3.2x via quantization (AWQ / FP8) and custom Triton kernels."
                ]
            }
        ],
        "education": "M.S. in Artificial Intelligence, Stanford University (2019)"
    },
    {
        "id": "08_Cloud_Security_ZeroTrust_Lead",
        "name": "Abhinav S.",
        "title": "Cloud Security & Zero-Trust Architecture Lead",
        "phone": "+1 (555) 712-3456",
        "email": EMAIL,
        "location": "Denver, CO (Remote)",
        "summary": "Cloud Security Architect with 9 years hardening enterprise cloud environments across AWS and GCP. Deep expertise in Zero Trust network architectures, HashiCorp Vault secrets management, IAM least-privilege automation, and SOC2 / ISO-27001 compliance.",
        "skills": ["Cloud Security", "AWS IAM", "HashiCorp Vault", "Zero Trust", "Istio mTLS", "SOC2 Compliance", "Trivy / Snyk", "Terraform", "Kubernetes Hardening", "Python", "Incident Response"],
        "experience": [
            {
                "role": "Head of Cloud Security Architecture",
                "company": "Fortress Cloud Security",
                "period": "2021 - Present",
                "bullets": [
                    "Enforced Zero Trust security posture with mTLS service-to-service communication using Istio and HashiCorp Vault dynamic secrets.",
                    "Constructed hardened CI/CD deployment pipelines with automated container vulnerability scanning (Trivy), preventing high-severity CVE deployments.",
                    "Automated IAM least-privilege policy pruning using AWS Access Analyzer and custom Python audit lambdas.",
                    "Directed SOC2 Type II compliance audit, successfully certifying identity governance, audit logging, and cryptographic data isolation."
                ]
            },
            {
                "role": "Senior Security Engineer",
                "company": "Apex Cloud Systems",
                "period": "2016 - 2021",
                "bullets": [
                    "Configured AWS Security Hub, GuardDuty, and centralized SIEM ingestion into Splunk.",
                    "Conducted regular penetration testing and red-team adversary simulations on production cloud perimeters."
                ]
            }
        ],
        "education": "B.S. in Computer Engineering, University of Texas at Austin (2016)"
    },
    {
        "id": "09_Kubernetes_Platform_Engineer",
        "name": "Abhinav Joshi",
        "title": "Staff Kubernetes Platform Engineer",
        "phone": "+1 (555) 519-7723",
        "email": EMAIL,
        "location": "San Jose, CA (Remote)",
        "summary": "Staff Platform Engineer specializing in container orchestration, Kubernetes custom controllers (CRDs / Kubebuilder), service meshes (Cilium, Istio), and multi-tenant developer platforms. CKA and CKS certified.",
        "skills": ["Kubernetes (EKS, GKE)", "Go", "Kubebuilder / CRDs", "Helm", "Cilium CNI", "eBPF", "ArgoCD", "Crossplane", "Prometheus", "Linux Kernel", "Docker"],
        "experience": [
            {
                "role": "Staff Platform Engineer",
                "company": "KubeCloud Enterprise",
                "period": "2022 - Present",
                "bullets": [
                    "Built internal developer platform (IDP) with custom Kubernetes CRDs in Go, enabling 200+ engineers to self-serve production environments in under 3 minutes.",
                    "Implemented Cilium eBPF-based networking and network policies, replacing kube-proxy and reducing inter-pod latency by 35%.",
                    "Managed multi-cluster fleet of 50+ Kubernetes clusters using ArgoCD and GitOps standards.",
                    "Hardened cluster security according to CIS Kubernetes benchmarks, implementing Falco runtime threat detection."
                ]
            },
            {
                "role": "DevOps / Infrastructure Engineer",
                "company": "CloudNative Solutions",
                "period": "2018 - 2022",
                "bullets": [
                    "Migrated legacy Docker Swarm workloads to managed AWS EKS clusters.",
                    "Created Helm charts and CI/CD automated test harness for distributed microservices."
                ]
            }
        ],
        "education": "B.S. in Computer Science, San Jose State University (2018)"
    },
    {
        "id": "10_Senior_QA_Automation_Engineer",
        "name": "Abhinav Singh",
        "title": "Senior QA Automation & Test Lead",
        "phone": "+1 (555) 632-1109",
        "email": EMAIL,
        "location": "Atlanta, GA (Remote)",
        "summary": "Senior QA Automation Engineer with 7+ years developing automated test frameworks for complex microservice architectures and web applications. Expert in Playwright, Cypress, Pytest, REST API testing, and performance testing with k6.",
        "skills": ["Playwright", "Cypress", "Python (Pytest)", "TypeScript", "k6 Performance Testing", "REST API Testing", "Docker", "GitHub Actions CI", "Postman", "Test Rail"],
        "experience": [
            {
                "role": "Lead QA Automation Engineer",
                "company": "QualityFirst Systems",
                "period": "2021 - Present",
                "bullets": [
                    "Engineered end-to-end browser automation framework in TypeScript with Playwright running 400+ parallel test specs across Chrome, Firefox, and WebKit.",
                    "Integrated automated regression suites into GitHub Actions PR pipelines, catching 98% of UI regressions before staging release.",
                    "Developed backend API test harness with Python Pytest and Faker, covering 100% of critical checkout and auth endpoints.",
                    "Conducted stress and load testing with k6, identifying database locking bottlenecks prior to Black Friday peak."
                ]
            },
            {
                "role": "QA Automation Engineer",
                "company": "Apex Software Labs",
                "period": "2017 - 2021",
                "bullets": [
                    "Migrated legacy Selenium Java test suite to Cypress, cutting test execution duration from 90 minutes to 14 minutes.",
                    "Authored automated synthetic monitoring scripts alerting team to production regression within 60 seconds."
                ]
            }
        ],
        "education": "B.S. in Computer Information Systems, Georgia Tech (2017)"
    },
    {
        "id": "11_Infrastructure_Terraform_Specialist",
        "name": "Abhinav Choudhury",
        "title": "Senior Infrastructure & Terraform Specialist",
        "phone": "+1 (555) 881-3342",
        "email": EMAIL,
        "location": "Raleigh, NC (Remote)",
        "summary": "Infrastructure Automation Specialist with 8 years dedicated to Terraform / OpenTofu module design, multi-cloud foundations, policy-as-code (Sentinel / OPA), and state management. HashiCorp Certified Terraform Associate.",
        "skills": ["Terraform", "OpenTofu", "Terragrunt", "AWS", "Azure", "OPA / Conftest", "Python", "Bash", "GitHub Actions", "Packer", "Linux", "GitOps"],
        "experience": [
            {
                "role": "Principal Infrastructure Automation Engineer",
                "company": "InfraTerra Cloud Corp",
                "period": "2021 - Present",
                "bullets": [
                    "Engineered enterprise Terraform module library with Terragrunt managing 400+ cloud resources across 12 AWS accounts.",
                    "Enforced security policy-as-code using Open Policy Agent (OPA) and Conftest, blocking insecure S3 buckets and public IAM roles in CI.",
                    "Designed zero-downtime state migration strategies moving legacy AWS CloudFormation stacks to modular Terraform code.",
                    "Built automated drift-detection scheduled jobs alerting engineering teams to out-of-band console modifications."
                ]
            },
            {
                "role": "Cloud Infrastructure Engineer",
                "company": "CloudForge Technologies",
                "period": "2017 - 2021",
                "bullets": [
                    "Automated golden AMI image pipelines using HashiCorp Packer and Ansible.",
                    "Maintained centralized Terraform remote state storage on S3 with DynamoDB state locking."
                ]
            }
        ],
        "education": "B.S. in Computer Science, North Carolina State University (2017)"
    },
    {
        "id": "12_Career_Transition_Associate_Cloud_Engineer",
        "name": "Abhinav N.",
        "title": "Associate Cloud & DevOps Engineer",
        "phone": "+1 (555) 231-9081",
        "email": EMAIL,
        "location": "Philadelphia, PA (Remote)",
        "summary": "Motivated Associate Cloud Engineer with a background in Mechanical Engineering and 2 years intensive software development and cloud operations experience. Passionate about automation, infrastructure as code, and cloud monitoring. Holds AWS Certified Developer Associate certification.",
        "skills": ["AWS (EC2, S3, Lambda, CloudWatch)", "Python", "Linux Command Line", "Docker", "Git", "Terraform Basics", "CI/CD Concepts", "SQL Basics"],
        "experience": [
            {
                "role": "Associate Cloud Engineer",
                "company": "Catalyst Cloud Solutions",
                "period": "2024 - Present",
                "bullets": [
                    "Assisted in managing AWS infrastructure resources and deploying containerized Python microservices.",
                    "Developed serverless AWS Lambda automation functions in Python to clean up untagged EBS snapshots, saving $1,500/month.",
                    "Created CloudWatch dashboards and metrics filters for application error rates and request latencies.",
                    "Collaborated with senior DevOps engineers to document deployment runbooks and rollback procedures."
                ]
            },
            {
                "role": "Systems Automation Analyst",
                "company": "Precision Engineering Systems",
                "period": "2021 - 2024",
                "bullets": [
                    "Wrote Python data analysis scripts processing telemetry data from industrial manufacturing hardware.",
                    "Automated daily report generation and database backups using Cron and Bash scripting."
                ]
            }
        ],
        "education": "B.S. in Mechanical Engineering, Penn State University (2021) | AWS Certified Developer Associate (2024)"
    }
]

# Edge case personas
edge_cases = [
    {
        "id": "edge-cases/01_Minimalist_Sparse_Resume",
        "name": "Abhinav Mini",
        "title": "Junior Developer",
        "phone": "+1 (555) 111-2222",
        "email": EMAIL,
        "location": "Remote",
        "summary": "Junior software developer with 1 year experience writing Python and JavaScript.",
        "skills": ["Python", "JavaScript", "Git"],
        "experience": [
            {
                "role": "Junior Programmer",
                "company": "Startup Co",
                "period": "2024 - 2025",
                "bullets": [
                    "Wrote unit tests and fixed bugs in web backend."
                ]
            }
        ],
        "education": "B.S. in Computer Science (2024)"
    },
    {
        "id": "edge-cases/02_Verbose_Executive_Resume",
        "name": "Abhinav Executive",
        "title": "VP of Cloud Platform & Systems Engineering",
        "phone": "+1 (555) 999-8888",
        "email": EMAIL,
        "location": "San Francisco, CA",
        "summary": "Executive technology leader with 16+ years scaling engineering organizations from early-stage through IPO. Proven executive track record overseeing 120+ cloud engineers, managing $25M annual infrastructure budgets, and spearheading enterprise cloud transformation, security compliance (SOC2 Type II, FedRAMP), and global 99.999% reliability standards.",
        "skills": ["Executive Leadership", "Strategic Cloud Architecture", "Budget Optimization ($25M+)", "Global Infrastructure", "SOC2 Type II / FedRAMP", "Multi-Cloud Strategy", "DevOps Culture", "Incident Management", "Talent Mentorship", "Vendor Negotiation", "Kubernetes", "AWS / GCP"],
        "experience": [
            {
                "role": "Vice President of Cloud Platform Engineering",
                "company": "Global Enterprise Systems Corp",
                "period": "2020 - Present",
                "bullets": [
                    "Lead an organization of 120+ cloud, SRE, and platform engineers across North America and Europe.",
                    "Managed $25M annual cloud budget, delivering $6.2M in annual efficiency savings through contractual reservation planning and architecture refactoring.",
                    "Maintained five-nines (99.999%) availability across core enterprise financial transactional platforms handling $80B annual GMV.",
                    "Established security and governance committee achieving FedRAMP In-Process status and continuous SOC2 compliance."
                ]
            },
            {
                "role": "Director of Infrastructure & Operations",
                "company": "HyperGrowth Cloud Inc.",
                "period": "2015 - 2020",
                "bullets": [
                    "Grew infrastructure engineering department from 8 to 45 engineers through high-bar talent acquisition.",
                    "Led complete cloud migration from colocation datacenters to AWS, reducing operating overhead by 40%.",
                    "Introduced site reliability engineering (SRE) practices and company-wide post-mortem culture."
                ]
            },
            {
                "role": "Principal Systems Architect",
                "company": "Foundational Tech Solutions",
                "period": "2010 - 2015",
                "bullets": [
                    "Architected high-throughput distributed caching and database clustering solutions.",
                    "Authored company foundational engineering RFC guidelines and design review standards."
                ]
            }
        ],
        "education": "M.S. in Computer Science, Stanford University (2010) | B.S. in Electrical Engineering, MIT (2008)"
    },
    {
        "id": "edge-cases/03_Special_Characters_Unicode_Resume",
        "name": "Abhinav René-François Müller",
        "title": "Sr. Systems Eng. & Internationalization Lead",
        "phone": "+1 (555) 777-6655",
        "email": EMAIL,
        "location": "Montréal, QC / Remote",
        "summary": "Senior Software Architect specializing in UTF-8 encoding, multi-lingual data pipelines (日本語, Español, Français), and internationalized high-concurrency systems. Expert in handling edge-case encodings, sanitizing unicode payloads, and preventing injection vulnerabilities.",
        "skills": ["Python 3 (Unicode Internals)", "i18n & l10n", "PostgreSQL (Collation & Encodings)", "FastAPI", "Go", "Docker", "Zero Trust", "Special Character Sanitization", "UTF-8/UTF-16"],
        "experience": [
            {
                "role": "Lead i18n Systems Engineer",
                "company": "GlobalLingo Systems SA",
                "period": "2021 - Present",
                "bullets": [
                    "Designed internationalization data ingestion engine processing multi-byte CJK and Arabic RTL text flawlessly.",
                    "Eliminated subtle mojibake and encoding corruption bugs across PostgreSQL database connections.",
                    "Implemented rigorous character validation and normalization (NFC/NFD) in API request schemas."
                ]
            }
        ],
        "education": "B.Sc. Informatique, Université de Montréal (2019)"
    },
    {
        "id": "edge-cases/04_Formatting_Quirks_Resume",
        "name": "Abhinav Techcraft",
        "title": "Cloud Architect & System Builder",
        "phone": "+1 (555) 432-8765",
        "email": EMAIL,
        "location": "Remote Everywhere",
        "summary": "Non-traditional self-taught engineer with 6 years building distributed cloud backends, infrastructure automation tools, and open-source packages.",
        "skills": ["Terraform", "Kubernetes", "Python", "Go", "AWS", "Bash", "Prometheus", "Linux", "Open Source"],
        "experience": [
            {
                "role": "Independent Cloud Infrastructure Consultant",
                "company": "Self-Employed / Various Tech Clients",
                "period": "2020 - Present",
                "bullets": [
                    "Contracted for 8 fast-growing startups designing initial AWS foundations with Terraform and Docker.",
                    "Built automated backup and disaster recovery solutions preventing catastrophic data loss.",
                    "Conducted developer workshops on containerization best practices and GitOps pipelines."
                ]
            }
        ],
        "education": "Self-Taught / Open Source Contributor | Multiple Cloud Certifications"
    }
]

def generate_txt(persona: dict, target_file: Path):
    lines = []
    lines.append("=" * 70)
    lines.append(f"{persona['name'].upper()}")
    lines.append(f"{persona['title']}")
    lines.append(f"Email: {persona['email']} | Phone: {persona['phone']} | Location: {persona['location']}")
    lines.append("=" * 70)
    lines.append("")
    lines.append("PROFESSIONAL SUMMARY")
    lines.append("-" * 70)
    lines.append(persona['summary'])
    lines.append("")
    lines.append("TECHNICAL PROFICIENCIES & CORE SKILLS")
    lines.append("-" * 70)
    lines.append(", ".join(persona['skills']))
    lines.append("")
    lines.append("PROFESSIONAL EXPERIENCE")
    lines.append("-" * 70)
    for exp in persona['experience']:
        lines.append(f"{exp['role']} — {exp['company']} ({exp['period']})")
        for bullet in exp['bullets']:
            lines.append(f"  • {bullet}")
        lines.append("")
    lines.append("EDUCATION & CREDENTIALS")
    lines.append("-" * 70)
    lines.append(persona['education'])
    lines.append("")
    target_file.write_text("\n".join(lines), encoding="utf-8")

def generate_pdf(persona: dict, target_file: Path):
    doc = SimpleDocTemplate(
        str(target_file),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#4f46e5"),
        fontName="Helvetica-Bold",
        spaceAfter=4
    )
    contact_style = ParagraphStyle(
        'DocContact',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#64748b"),
        fontName="Helvetica",
        spaceAfter=8
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceBefore=8,
        spaceAfter=3
    )
    body_style = ParagraphStyle(
        'BodyDark',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        fontName="Helvetica",
        spaceAfter=4
    )
    bullet_style = ParagraphStyle(
        'BulletStyle',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155"),
        fontName="Helvetica",
        leftIndent=10,
        spaceAfter=2.5
    )
    exp_header = ParagraphStyle(
        'ExpHeader',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceBefore=3,
        spaceAfter=1.5
    )

    story = []
    # Safe text replacement for ReportLab if non-ASCII
    safe_name = persona['name'].encode('latin-1', 'replace').decode('latin-1')
    story.append(Paragraph(safe_name, title_style))
    story.append(Paragraph(persona['title'], subtitle_style))
    contact_line = f"Email: <b>{persona['email']}</b> &nbsp;|&nbsp; Phone: {persona['phone']} &nbsp;|&nbsp; Location: {persona['location']}"
    story.append(Paragraph(contact_line, contact_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))

    # Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
    story.append(Paragraph(persona['summary'].encode('latin-1', 'replace').decode('latin-1'), body_style))
    story.append(Spacer(1, 3))

    # Skills
    story.append(Paragraph("TECHNICAL PROFICIENCIES", section_heading))
    skills_text = " • ".join(persona['skills']).encode('latin-1', 'replace').decode('latin-1')
    story.append(Paragraph(f"<b>Key Skills:</b> {skills_text}", body_style))
    story.append(Spacer(1, 3))

    # Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", section_heading))
    for exp in persona['experience']:
        story.append(Paragraph(f"{exp['role']} &nbsp;|&nbsp; <i>{exp['company']}</i> &nbsp;({exp['period']})".encode('latin-1', 'replace').decode('latin-1'), exp_header))
        for bullet in exp['bullets']:
            story.append(Paragraph(f"• {bullet}".encode('latin-1', 'replace').decode('latin-1'), bullet_style))
        story.append(Spacer(1, 3))

    # Education
    story.append(Paragraph("EDUCATION", section_heading))
    story.append(Paragraph(persona['education'].encode('latin-1', 'replace').decode('latin-1'), body_style))

    doc.build(story)

# Write all to both directories
all_items = personas + edge_cases

for target_dir in DIRS:
    for p in all_items:
        txt_path = target_dir / f"{p['id']}.txt"
        pdf_path = target_dir / f"{p['id']}.pdf"
        generate_txt(p, txt_path)
        try:
            generate_pdf(p, pdf_path)
        except Exception as e:
            print(f"PDF error for {p['id']}: {e}")
        print(f"Wrote to {target_dir.name}: {p['id']}")

    # Write README.md for this directory
    readme_content = f"""# TalentPilot AI — Synthetic Test Resumes Suite

This folder contains **{len(personas)} core engineering personas** and **{len(edge_cases)} edge-case resumes** built for end-to-end evaluation, testing, and demonstration of the TalentPilot AI recruitment platform.

All candidate profiles use the standardized evaluation inbox:
**`{EMAIL}`**

---

## 1. Primary Personas ({len(personas)})

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
   - Dispatch a personalized invitation email with credentials to `{EMAIL}`.
"""
    (target_dir / "README.md").write_text(readme_content, encoding="utf-8")
    print(f"Generated README.md in {target_dir}")

print("SUCCESS: All synthetic resumes and READMEs created!")
