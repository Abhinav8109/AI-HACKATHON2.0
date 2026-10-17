import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

resumes_dir = Path(r"c:\Users\abhin\Videos\aihack4\resumes")
resumes_dir.mkdir(parents=True, exist_ok=True)

EMAIL = "abhinavclouds@gmail.com"

personas = [
    {
        "id": "1_Distributed_Systems_Architect",
        "name": "Abhinav Sharma",
        "title": "Senior Distributed Systems Architect",
        "phone": "+1 (555) 392-8819",
        "email": EMAIL,
        "location": "San Francisco, CA (Remote)",
        "summary": "Senior Distributed Systems Architect with 8+ years designing fault-tolerant event-driven platforms, high-concurrency microservices, and distributed storage engines. Proven track record scaling backends handling 150,000+ RPS across multi-region cloud environments with sub-15ms p99 latency.",
        "skills": ["Distributed Systems", "Go", "Python", "Rust", "Apache Kafka", "PostgreSQL", "Redis Cluster", "Raft Consensus", "Kubernetes", "OpenTelemetry", "High Concurrency", "System Design"],
        "experience": [
            {
                "role": "Staff Distributed Systems Architect",
                "company": "CloudScale Platforms Inc.",
                "period": "2022 - Present",
                "bullets": [
                    "Architected high-throughput financial event streaming ingestion engine processing 150k RPS using Go, Kafka, and Redis Streams with zero data loss.",
                    "Designed zero-downtime database failover automation using Raft consensus and PostgreSQL logical replication, reducing failover RTO from 12 mins to under 1.5 seconds.",
                    "Eliminated write amplification contention on distributed ledger tables by implementing declarative range partitioning and custom composite BRIN indexing.",
                    "Authored distributed tracing standards across 45 microservices using OpenTelemetry and Jaeger, cutting critical incident MTTR by 52%."
                ]
            },
            {
                "role": "Senior Backend Systems Engineer",
                "company": "Nexus Data Infrastructure",
                "period": "2018 - 2022",
                "bullets": [
                    "Engineered distributed cache invalidation protocol handling 80,000 ops/sec across 12-node Redis Cluster.",
                    "Migrated monolithic payment settlement services into decoupled event-driven services with Python FastAPI and gRPC.",
                    "Led chaos engineering drills and simulated partition splits (CAP theorem verification) across multi-zone Kubernetes clusters."
                ]
            }
        ],
        "education": "B.S. in Computer Science, Carnegie Mellon University (2018)"
    },
    {
        "id": "2_AI_Systems_Staff_Engineer",
        "name": "Abhinav Cloud",
        "title": "Principal AI & LLM Systems Engineer",
        "phone": "+1 (555) 481-9920",
        "email": EMAIL,
        "location": "Seattle, WA (Remote)",
        "summary": "Principal AI Platform Engineer specializing in high-throughput LLM serving infrastructure, specialized multi-agent orchestrators, and enterprise vector search. Extensive experience optimizing inference latency with vLLM, FlashAttention-2, and TensorRT-LLM.",
        "skills": ["Python", "PyTorch", "vLLM", "FlashAttention", "LangChain", "Gemini API", "FastAPI", "Vector Databases", "Qdrant", "Ray", "Triton Inference Server", "CUDA"],
        "experience": [
            {
                "role": "Principal AI Infrastructure Engineer",
                "company": "Synthetix AI Labs",
                "period": "2023 - Present",
                "bullets": [
                    "Spearheaded enterprise LLM serving cluster serving 80M daily tokens with vLLM and continuous batching on NVIDIA H100s, slashing p99 Time-To-First-Token by 44%.",
                    "Architected specialized multi-agent evaluation orchestrator with bounded retries, structured JSON outputs, and adversarial critic validation.",
                    "Designed low-latency hybrid semantic search pipeline using Qdrant vector indexing and cross-encoder re-ranking handling 3,500 queries/sec.",
                    "Built prompt-injection defense shield sanitizing untrusted candidate documents and neutralizing delimiter hijack payloads."
                ]
            },
            {
                "role": "Senior Machine Learning Systems Engineer",
                "company": "DeepVision Intelligence",
                "period": "2019 - 2023",
                "bullets": [
                    "Trained and fine-tuned domain-specific transformer models using PyTorch Distributed Data Parallel (DDP).",
                    "Built end-to-end feature store and model evaluation tracking pipeline serving real-time scoring to production microservices.",
                    "Optimized inference throughput by 3.2x via quantization (AWQ / FP8) and custom Triton kernels."
                ]
            }
        ],
        "education": "M.S. in Artificial Intelligence, Stanford University (2019)"
    },
    {
        "id": "3_Senior_FullStack_Product_Engineer",
        "name": "Abhinav Kumar",
        "title": "Senior Full-Stack Product Engineer",
        "phone": "+1 (555) 604-1234",
        "email": EMAIL,
        "location": "New York, NY (Remote)",
        "summary": "Senior Full-Stack Engineer with 7+ years delivering user-obsessed SaaS products. Specialized in React 19, TypeScript, Tailwind CSS, FastAPI, and PostgreSQL. Passionate about design token systems, WCAG 2.2 AA accessibility, and micro-interactions.",
        "skills": ["React 19", "TypeScript", "Tailwind CSS", "Next.js", "Python", "FastAPI", "PostgreSQL", "Node.js", "GraphQL", "Framer Motion", "State Management", "WCAG 2.2 AA"],
        "experience": [
            {
                "role": "Lead Frontend / Full-Stack Engineer",
                "company": "Lumina SaaS Studio",
                "period": "2021 - Present",
                "bullets": [
                    "Architected and built company's primary analytics command center with React 19, TypeScript, and Tailwind CSS, achieving 99 Lighthouse performance score.",
                    "Engineered real-time collaboration canvas with optimistic UI updates and WebSocket autosave, eliminating draft loss entirely.",
                    "Refactored design token architecture with WCAG 2.2 AA accessible focus rings, keyboard navigability, and luminous light/dark themes.",
                    "Developed backend FastAPI REST endpoints with Pydantic validation schemas and SQLAlchemy relational storage."
                ]
            },
            {
                "role": "Full-Stack Software Engineer",
                "company": "CraftFlow Technologies",
                "period": "2017 - 2021",
                "bullets": [
                    "Built responsive web portals supporting 300,000 monthly active enterprise users.",
                    "Integrated Stripe billing, role-based JWT authorization, and tenant isolation policies.",
                    "Mentored junior engineers and led code review initiatives improving team velocity by 30%."
                ]
            }
        ],
        "education": "B.S. in Software Engineering, University of Michigan (2017)"
    },
    {
        "id": "4_Cloud_Security_DevOps_Platform_Lead",
        "name": "Abhinav S.",
        "title": "Cloud Security & DevOps Platform Lead",
        "phone": "+1 (555) 712-3456",
        "email": EMAIL,
        "location": "Austin, TX (Remote)",
        "summary": "DevOps and Cloud Security Platform Lead with 9 years architecting resilient multi-cloud foundations on AWS and GCP. Deep expertise in Terraform, Kubernetes cluster hardening, Zero Trust network architecture, and SOC2 / ISO-27001 compliance automation.",
        "skills": ["Kubernetes", "Docker", "Terraform", "AWS", "GCP", "Zero Trust", "Istio Service Mesh", "GitHub Actions CI/CD", "Vault", "Linux Internals", "SOC2 Compliance", "Prometheus"],
        "experience": [
            {
                "role": "Head of Platform & Cloud Infrastructure",
                "company": "Fortress Cloud Security",
                "period": "2021 - Present",
                "bullets": [
                    "Designed and automated multi-region AWS EKS Kubernetes infrastructure with Terraform and GitOps (ArgoCD) achieving 99.99% uptime SLA.",
                    "Enforced Zero Trust security posture with mTLS service-to-service communication using Istio and HashiCorp Vault dynamic secrets.",
                    "Constructed hardened CI/CD deployment pipelines with automated container vulnerability scanning (Trivy), reducing deployment lead time from days to 14 minutes.",
                    "Directed SOC2 Type II compliance audit, successfully certifying identity governance, audit logging, and cryptographic data isolation."
                ]
            },
            {
                "role": "Senior Cloud Infrastructure Engineer",
                "company": "Apex Cloud Systems",
                "period": "2016 - 2021",
                "bullets": [
                    "Engineered automated blue-green zero-downtime deployment workflows for 60+ microservices.",
                    "Implemented centralized logging and metrics monitoring with Prometheus, Grafana, and OpenSearch.",
                    "Reduced cloud spend by 38% via Kubernetes cluster auto-scaling and spot instance optimization."
                ]
            }
        ],
        "education": "B.S. in Computer Engineering, University of Texas at Austin (2016)"
    },
    {
        "id": "5_Data_Platform_Streaming_Engineer",
        "name": "Abhinav Verma",
        "title": "Principal Data Platform & Streaming Engineer",
        "phone": "+1 (555) 833-9012",
        "email": EMAIL,
        "location": "Chicago, IL (Remote)",
        "summary": "Principal Data Engineer with 8+ years designing enterprise lakehouse platforms, real-time streaming pipelines, and analytical data layers. Proven success handling petabyte-scale event pipelines with Apache Flink, Kafka, Snowflake, and dbt.",
        "skills": ["Apache Kafka", "Apache Flink", "Apache Spark", "Python", "SQL", "Snowflake", "dbt", "Airflow", "Delta Lake", "Data Modeling", "Streaming ETL", "Data Observability"],
        "experience": [
            {
                "role": "Principal Data Platform Architect",
                "company": "Kinetix Data Systems",
                "period": "2022 - Present",
                "bullets": [
                    "Architected unified real-time streaming data ingestion engine processing 2.4 billion daily events using Apache Flink and Kafka.",
                    "Designed petabyte-scale Snowflake modern data warehouse and modular dbt transformation DAGs serving 500+ analytical users.",
                    "Built automated data quality observability platform with Great Expectations, preventing corrupt pipeline ingestion before downstream impact.",
                    "Optimized Snowflake warehouse sizing, query clustering keys, and materialized views, decreasing monthly compute costs by $45,000."
                ]
            },
            {
                "role": "Senior Data Infrastructure Engineer",
                "company": "OmniStream Analytics",
                "period": "2017 - 2022",
                "bullets": [
                    "Built batch and streaming ETL jobs in PySpark on AWS EMR processing 50TB daily logs.",
                    "Orchestrated complex enterprise workflow dependencies using Apache Airflow with custom sensors and SLA monitoring.",
                    "Collaborated with ML engineering teams to build low-latency feature stores for real-time model scoring."
                ]
            }
        ],
        "education": "B.S. in Information Systems, University of Illinois Urbana-Champaign (2017)"
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
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#4f46e5"),
        fontName="Helvetica-Bold",
        spaceAfter=4
    )
    contact_style = ParagraphStyle(
        'DocContact',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#64748b"),
        fontName="Helvetica",
        spaceAfter=10
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyDark',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        fontName="Helvetica",
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'BulletStyle',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        fontName="Helvetica",
        leftIndent=12,
        spaceAfter=3
    )
    exp_header = ParagraphStyle(
        'ExpHeader',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceBefore=4,
        spaceAfter=2
    )

    story = []
    story.append(Paragraph(persona['name'], title_style))
    story.append(Paragraph(persona['title'], subtitle_style))
    contact_line = f"Email: <b>{persona['email']}</b> &nbsp;|&nbsp; Phone: {persona['phone']} &nbsp;|&nbsp; Location: {persona['location']}"
    story.append(Paragraph(contact_line, contact_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=10))

    # Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
    story.append(Paragraph(persona['summary'], body_style))
    story.append(Spacer(1, 4))

    # Skills
    story.append(Paragraph("TECHNICAL PROFICIENCIES", section_heading))
    skills_text = " • ".join(persona['skills'])
    story.append(Paragraph(f"<b>Key Skills:</b> {skills_text}", body_style))
    story.append(Spacer(1, 4))

    # Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", section_heading))
    for exp in persona['experience']:
        story.append(Paragraph(f"{exp['role']} &nbsp;|&nbsp; <i>{exp['company']}</i> &nbsp;({exp['period']})", exp_header))
        for bullet in exp['bullets']:
            story.append(Paragraph(f"• {bullet}", bullet_style))
        story.append(Spacer(1, 4))

    # Education
    story.append(Paragraph("EDUCATION", section_heading))
    story.append(Paragraph(persona['education'], body_style))

    doc.build(story)

# Generate both .txt and .pdf for all 5 personas
for p in personas:
    txt_path = resumes_dir / f"{p['id']}.txt"
    pdf_path = resumes_dir / f"{p['id']}.pdf"
    generate_txt(p, txt_path)
    generate_pdf(p, pdf_path)
    print(f"Generated: {txt_path.name} & {pdf_path.name}")

print("All resumes created successfully in:", resumes_dir)
