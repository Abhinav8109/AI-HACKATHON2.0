import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

output_dir = Path(r"c:\Users\abhin\Videos\aihack4\resume-presentation")
output_dir.mkdir(parents=True, exist_ok=True)

resumes = [
    {
        "id": "Prajjwal_ICC_Monitoring_Engineer",
        "name": "Prajjwal Mishra",
        "role_badge": "ICC Monitoring Engineer",
        "title": "Lead ICC Monitoring & Command Center Systems Specialist",
        "phone": "+1 (555) 724-1189",
        "email": "prajjwal.icc@talentpilot-demo.ai",
        "location": "Dallas, TX (Hybrid / Remote)",
        "summary": "Enterprise Command Center and Infrastructure Telemetry Specialist with 6+ years driving 24x7 Integrated Command Center (ICC/NOC) surveillance, automated incident response, and end-to-end observability across distributed cloud and on-premise infrastructure. Expert in Prometheus, Grafana, Dynatrace, Splunk, and ServiceNow Event Management, orchestrating rapid P1/P2 triage, SLA compliance, telemetry noise filtering, and high-availability operations.",
        "skills_categories": [
            ("Telemetry & Observability", "Prometheus, Grafana, Dynatrace, Splunk Enterprise, Nagios Core, Datadog, Zabbix, Elastic Stack (ELK)"),
            ("Incident & Event Management", "ServiceNow Event Management, PagerDuty, Opsgenie, ITIL v4 Incident & Problem Lifecycle, Major Incident Management (MIM)"),
            ("Infrastructure Surveillance", "Enterprise Server Racks, VMware vSphere, SAN/NAS Storage arrays, Cisco ACI, Network Core Switches, AWS CloudWatch, Azure Monitor"),
            ("Automation & Scripting", "Python 3, Bash / Shell Scripting, Webhooks, REST APIs, Ansible Automation, Automated Runbook Execution"),
            ("Governance & Metrics", "24x7 Shift Handover, MTTR & MTBF Optimization, SLA Auditing, Root Cause Analysis (RCA), Blameless Postmortems")
        ],
        "experience": [
            {
                "role": "Lead ICC Monitoring & Telemetry Engineer",
                "company": "Vanguard Telecom & Cloud Infrastructure",
                "period": "2022 - Present",
                "bullets": [
                    "Direct 24x7 Integrated Command Center operations across 3 geo-distributed enterprise datacenters, supervising real-time telemetry for 4,200+ physical and virtual host nodes.",
                    "Architected 40+ high-definition Grafana and Dynatrace telemetry dashboards, correlating network throughput, CPU/memory threshold spikes, and service latency in real time.",
                    "Engineered automated event suppression and alert deduplication rules in Splunk and ServiceNow, reducing alert noise by 64% and eliminating operator fatigue.",
                    "Command live P1/P2 critical outage bridges with cross-functional network, database, and platform engineering teams, reducing Mean Time to Resolution (MTTR) from 38 minutes to under 14 minutes.",
                    "Designed webhook-based automated remediation workflows triggering self-healing runbooks for transient memory leaks, service restarts, and disk space reclamation."
                ]
            },
            {
                "role": "Infrastructure Monitoring & NOC Specialist",
                "company": "Apex Enterprise Systems",
                "period": "2018 - 2022",
                "bullets": [
                    "Monitored mission-critical banking transactions, payment gateways, and network backbones using Nagios, Zabbix, and Prometheus with 99.995% SLA adherence.",
                    "Conducted automated hourly health checks, synthetic availability runs, and capacity forecasting reports delivered to executive leadership.",
                    "Authored 25+ comprehensive Standard Operating Procedures (SOPs) and disaster recovery runbooks adopted by all ICC shift operators and incident response squads."
                ]
            }
        ],
        "certifications": [
            "ITIL v4 Foundation / Managing Professional Certified",
            "Splunk Enterprise Certified Power User",
            "Dynatrace Associate Observability Certification"
        ],
        "education": "B.Tech in Electronics & Telecommunication Engineering, National Institute of Technology (2018)"
    },
    {
        "id": "Neeraj_Linux_Systems_Engineer",
        "name": "Neeraj Kumar",
        "role_badge": "Linux Systems Engineer",
        "title": "Senior Linux Platform & Infrastructure Systems Engineer",
        "phone": "+1 (555) 831-4092",
        "email": "neeraj.linux@talentpilot-demo.ai",
        "location": "Chicago, IL (Hybrid / Remote)",
        "summary": "Senior Linux Systems Engineer with 7+ years of deep expertise in enterprise Linux administration, kernel optimization, automated configuration management, and high-availability infrastructure. Specializing in Red Hat Enterprise Linux (RHEL 8/9), Ubuntu Server, advanced Bash automation, systemd internals, storage LVM/ZFS, and zero-downtime OS lifecycle maintenance across 1,800+ bare-metal and virtualized servers.",
        "skills_categories": [
            ("Operating Systems", "Red Hat Enterprise Linux (RHEL 7/8/9), CentOS, Rocky Linux, Ubuntu Server, Debian, Oracle Linux"),
            ("Scripting & Automation", "Advanced Bash Scripting, Python 3, Awk, Sed, Ansible Playbooks, Puppet, Cron & Systemd Timers"),
            ("Kernel & Performance Tuning", "Sysctl parameter optimization, TCP/IP stack tuning, perf, sar, vmstat, iostat, strace, kdump, hugepages, cgroups v2"),
            ("Storage & Filesystems", "LVM (Logical Volume Management), EXT4, XFS, ZFS, RAID 1/5/10, NFS, iSCSI, Multipath I/O"),
            ("Security & Hardening", "SELinux policy management, CIS Level 1/2 Benchmarks, OpenSCAP, iptables/nftables, Firewalld, SSH hardening, sudoers RBAC"),
            ("Clustering & High Availability", "Pacemaker / Corosync HA clusters, DRBD, Keepalived, BIND DNS, DHCP, Network Bonding / Teaming")
        ],
        "experience": [
            {
                "role": "Senior Linux Platform Engineer",
                "company": "Stratus Systems Architecture",
                "period": "2021 - Present",
                "bullets": [
                    "Oversee fleet reliability and performance for 1,800+ RHEL and Ubuntu compute instances across hybrid cloud and on-premise blade datacenters.",
                    "Automated unattended OS provisioning and security hardening using PXE, Kickstart, and Ansible, reducing bare-metal provisioning time from 4 hours to 18 minutes.",
                    "Tuned Linux kernel network stack parameters (TCP socket buffers, backlog queues, SYN cookies, epoll) to support ultra-low latency transaction systems handling 45,000 req/sec.",
                    "Investigated and resolved complex production kernel panics and out-of-memory (OOM) killer incidents through memory dump analysis using crash and kdump.",
                    "Architected multi-node active/passive and active/active Linux HA clusters utilizing Pacemaker, Corosync, and DRBD with automated fencing (STONITH).",
                    "Enforced SELinux enforcing mode across all production nodes and orchestrated automated CVE vulnerability remediation via Red Hat Satellite."
                ]
            },
            {
                "role": "Linux Systems Administrator",
                "company": "Quantix Infrastructure Solutions",
                "period": "2017 - 2021",
                "bullets": [
                    "Administered enterprise storage volume expansion, filesystem migrations (EXT4 to XFS), and LVM snapshot backups for high-traffic database clusters.",
                    "Developed automated Python and Bash maintenance daemons for log rotation, disk space reclamation, and automated system compliance audits.",
                    "Migrated 300+ legacy CentOS 6/7 workloads to RHEL 8 with zero production downtime or customer degradation."
                ]
            }
        ],
        "certifications": [
            "Red Hat Certified Engineer (RHCE) - RHEL 9 (Verification #180-234-901)",
            "Red Hat Certified System Administrator (RHCSA)",
            "Linux Professional Institute LPIC-2 Linux Engineer"
        ],
        "education": "B.Tech in Information Technology, Delhi Technological University (2017)"
    },
    {
        "id": "Vaishnavi_ServiceNow_Engineer",
        "name": "Vaishnavi Kulkarni",
        "role_badge": "ServiceNow Engineer",
        "title": "Lead ServiceNow Platform Engineer & Workflow Architect",
        "phone": "+1 (555) 912-6348",
        "email": "vaishnavi.servicenow@talentpilot-demo.ai",
        "location": "San Jose, CA (Hybrid / Remote)",
        "summary": "ServiceNow Platform Engineer and Implementation Specialist with 6+ years designing, developing, and architecting enterprise workflow solutions across ITSM, ITOM, CMDB, and Custom Applications. Proven track record configuring complex GlideScript business logic, Flow Designer automations, IntegrationHub spokes, Service Catalog items, and automated REST integrations with third-party enterprise platforms.",
        "skills_categories": [
            ("ServiceNow Suites", "ITSM (Incident, Problem, Change, Request, Knowledge), ITOM (Discovery, Service Mapping, Event Management), ITAM, Service Portal"),
            ("Platform Scripting", "GlideRecord, GlideSystem, GlideAjax, Script Includes, Business Rules, Client Scripts, UI Policies, UI Actions, Widget development"),
            ("Integration & Automation", "IntegrationHub, Flow Designer, REST / SOAP Web Services, Import Sets, Transform Maps, MID Server clusters, Webhooks"),
            ("Data & Architecture", "CMDB Health (Completeness, Correctness, Compliance), Identification & Reconciliation Engine (IRE), CSDM 4.0 framework"),
            ("Development Lifecycle", "Automated Test Framework (ATF), Update Sets, Scoped Applications, Studio, Agile/Scrum, Git integration, Performance Profiler")
        ],
        "experience": [
            {
                "role": "Lead ServiceNow Platform Engineer",
                "company": "Enterprise Cloud Innovations Inc.",
                "period": "2022 - Present",
                "bullets": [
                    "Architect enterprise ServiceNow Vancouver/Washington instance supporting 28,000 internal users and 1,200 fulfillment agents across 14 business departments.",
                    "Engineered 85+ reusable Script Includes, asynchronous Business Rules, and client-side GlideAjax scripts, reducing server-side execution latency by 38%.",
                    "Modernized legacy workflow engines into modular ServiceNow Flow Designer flows with custom IntegrationHub spokes connecting to Jira, Slack, Azure AD, and AWS.",
                    "Led CMDB maturation project utilizing ServiceNow Discovery and IRE pipelines, boosting CMDB accuracy score from 68% to 96.4% across 85,000 Configuration Items (CIs).",
                    "Built custom responsive Service Portal widgets using AngularJS, HTML5, and Bootstrap with self-service request catalogs handling 4,500 daily requests.",
                    "Implemented comprehensive Automated Test Framework (ATF) suites covering 90% of core change and incident workflows, cutting regression testing cycles by 70%."
                ]
            },
            {
                "role": "ServiceNow Implementation Consultant",
                "company": "Global Digital Workflows Inc.",
                "period": "2018 - 2022",
                "bullets": [
                    "Delivered end-to-end ITSM implementations, custom notification engines, and complex approval matrixes for Fortune 500 financial clients.",
                    "Configured MID Server clusters across secure network enclaves for automated SNMP/WMI infrastructure discovery.",
                    "Executed 4 platform family upgrades (Kingston through Rome) with zero unplanned downtime and minimal rollback issues."
                ]
            }
        ],
        "certifications": [
            "Certified ServiceNow Application Developer (CAD)",
            "Certified ServiceNow System Administrator (CSA)",
            "Certified Implementation Specialist - IT Service Management (CIS-ITSM)",
            "Certified Implementation Specialist - Discovery (CIS-Discovery)"
        ],
        "education": "B.E. in Computer Science and Engineering, Pune University (2018)"
    }
]

def generate_pdf(p, filepath):
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#0284c7"),
        fontName="Helvetica-Bold",
        spaceAfter=4
    )
    contact_style = ParagraphStyle(
        'DocContact',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#475569"),
        fontName="Helvetica",
        spaceAfter=8
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        fontSize=10.5,
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
    skill_category_style = ParagraphStyle(
        'SkillCategory',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e293b"),
        fontName="Helvetica",
        leftIndent=4,
        spaceAfter=2
    )
    bullet_style = ParagraphStyle(
        'BulletStyle',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#334155"),
        fontName="Helvetica",
        leftIndent=10,
        spaceAfter=2.5
    )
    exp_header = ParagraphStyle(
        'ExpHeader',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceBefore=3,
        spaceAfter=1.5
    )

    story = []
    # Header
    story.append(Paragraph(p['name'], title_style))
    story.append(Paragraph(f"{p['title']} &nbsp;|&nbsp; <b>{p['role_badge']}</b>", subtitle_style))
    contact_line = f"Email: <b>{p['email']}</b> &nbsp;|&nbsp; Phone: {p['phone']} &nbsp;|&nbsp; Location: {p['location']}"
    story.append(Paragraph(contact_line, contact_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=6))

    # Professional Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
    story.append(Paragraph(p['summary'], body_style))
    story.append(Spacer(1, 2))

    # Technical Proficiencies
    story.append(Paragraph("TECHNICAL PROFICIENCIES & CORE SKILLS", section_heading))
    for cat_name, cat_skills in p['skills_categories']:
        story.append(Paragraph(f"<b>{cat_name}:</b> {cat_skills}", skill_category_style))
    story.append(Spacer(1, 2))

    # Professional Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", section_heading))
    for exp in p['experience']:
        story.append(Paragraph(f"{exp['role']} &nbsp;|&nbsp; <i>{exp['company']}</i> &nbsp;({exp['period']})", exp_header))
        for bullet in exp['bullets']:
            story.append(Paragraph(f"• {bullet}", bullet_style))
        story.append(Spacer(1, 2))

    # Certifications
    story.append(Paragraph("CERTIFICATIONS & ACCREDITATIONS", section_heading))
    certs_text = " &nbsp;•&nbsp; ".join(p['certifications'])
    story.append(Paragraph(certs_text, body_style))
    story.append(Spacer(1, 2))

    # Education
    story.append(Paragraph("EDUCATION", section_heading))
    story.append(Paragraph(p['education'], body_style))

    doc.build(story)

def generate_txt(p, filepath):
    lines = [
        "=" * 80,
        f"{p['name'].upper()} - {p['role_badge'].upper()}",
        f"{p['title']}",
        f"Email: {p['email']} | Phone: {p['phone']} | Location: {p['location']}",
        "=" * 80,
        "",
        "PROFESSIONAL SUMMARY",
        "-" * 80,
        p['summary'],
        "",
        "TECHNICAL PROFICIENCIES & CORE SKILLS",
        "-" * 80,
    ]
    for cat_name, cat_skills in p['skills_categories']:
        lines.append(f"  * {cat_name}: {cat_skills}")
    lines.append("")
    lines.append("PROFESSIONAL EXPERIENCE")
    lines.append("-" * 80)
    for exp in p['experience']:
        lines.append(f"{exp['role']} - {exp['company']} ({exp['period']})")
        for bullet in exp['bullets']:
            lines.append(f"  * {bullet}")
        lines.append("")
    lines.append("CERTIFICATIONS & ACCREDITATIONS")
    lines.append("-" * 80)
    for cert in p['certifications']:
        lines.append(f"  * {cert}")
    lines.append("")
    lines.append("EDUCATION")
    lines.append("-" * 80)
    lines.append(f"  * {p['education']}")
    lines.append("")
    filepath.write_text("\n".join(lines), encoding="utf-8")

def generate_md(p, filepath):
    lines = [
        f"# {p['name']}",
        f"### {p['title']} ({p['role_badge']})",
        f"**Contact:** Email: `{p['email']}` | Phone: `{p['phone']}` | Location: {p['location']}",
        "",
        "---",
        "",
        "## Professional Summary",
        p['summary'],
        "",
        "## Technical Proficiencies & Core Skills",
    ]
    for cat_name, cat_skills in p['skills_categories']:
        lines.append(f"- **{cat_name}:** {cat_skills}")
    lines.append("")
    lines.append("## Professional Experience")
    for exp in p['experience']:
        lines.append(f"### {exp['role']} - *{exp['company']}* ({exp['period']})")
        for bullet in exp['bullets']:
            lines.append(f"- {bullet}")
        lines.append("")
    lines.append("## Certifications & Accreditations")
    for cert in p['certifications']:
        lines.append(f"- {cert}")
    lines.append("")
    lines.append("## Education")
    lines.append(f"- {p['education']}")
    lines.append("")
    filepath.write_text("\n".join(lines), encoding="utf-8")

for p in resumes:
    pdf_path = output_dir / f"{p['id']}.pdf"
    txt_path = output_dir / f"{p['id']}.txt"
    md_path = output_dir / f"{p['id']}.md"
    generate_pdf(p, pdf_path)
    generate_txt(p, txt_path)
    generate_md(p, md_path)
    print(f"Generated: {pdf_path.name}, {txt_path.name}, {md_path.name}")

print("All 3 resumes generated successfully in:", output_dir)
