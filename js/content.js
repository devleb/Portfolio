/* ==========================================================================
   Portfolio content — edit this file to update the site.
   Everything shown on the pages comes from here.
   ========================================================================== */

window.ASSETS = {
  profile: "assets/img/profile.jpg",
  blog1: "assets/img/blog-data-analysis.jpg",
  cv: "assets/cv/Georges-Matta-CV.pdf",
  cvFileName: "Georges-Matta-CV.pdf",
  eye: "assets/img/dynamic-eye.webp",
  eyeToken: "assets/img/dynamic-eye-token.webp"
};

window.CONTENT = {
  profile: {
    name: "Georges Matta",
    handle: "DevLeb",
    role: "Senior developer & project manager",
    location: "Lebanon",
    email: "testdevleb@gmail.com",
    since: 2012,
    intro:
      "I build backends in Go and Python, blockchain infrastructure, and intelligence tools that turn scattered data into clear decisions. I hold a BSc in Computer Science and currently manage projects at Dynamic Eye Technology across web development, mobile development and AI solutions.",
    focus: [
      {
        title: "Backend systems",
        text: "APIs and services in Go and Python (FastAPI), backed by PostgreSQL, SQLite and SQL Server.",
        tech: ["Go", "FastAPI", "PostgreSQL"]
      },
      {
        title: "Blockchain",
        text: "Go blockchain development, liquidity pool backends and node API integrations.",
        tech: ["Go", "SQLite", "Locust"]
      },
      {
        title: "Intelligence & data",
        text: "OSINT collection, scraping and automation, dashboards, and bilingual Arabic/English briefing material.",
        tech: ["Python", "pandas", "Plotly"]
      }
    ],
    exploring:
      "Offline Arabic + English retrieval-augmented generation with local LLMs (Ollama, LM Studio, AnythingLLM)."
  },

  education: {
    degree: {
      school: "Arab Open University",
      years: "2009 – 2013",
      title: "BSc Computer Science (Information Technology & Computing)",
      points: [
        "GPA 2.9 — award GPA 3.5",
        "Graduation project: a Facebook-style social network with integrated Google Maps"
      ]
    },
    certificates: [
      { title: "Microsoft Office Specialist: Outlook Associate (Office 2019)", date: "Apr 2023", id: "wEVPC-48Xr", issuer: "Microsoft" },
      { title: "Microsoft Power Platform Fundamentals", date: "Mar 2023", id: "wBrMA-2Fb6", issuer: "Microsoft" },
      { title: "HCIA-AI", date: "Mar 2022 – May 2022", issuer: "Huawei" },
      { title: "R & Python for Data Analysis", date: "Jan 2021 – Apr 2021" },
      { title: "Python Programming & Automation", date: "Jan 2019 – May 2019" },
      { title: "Django Website Build", date: "Oct 2018 – Dec 2018" }
    ]
  },

  /* Experience: each role has an id. A project belongs to a role through its `exp` field. */
  experience: [
    {
      id: "pm",
      role: "Project Manager — Dynamic Eye Technology",
      years: "2024 – Present",
      text: "Project manager for multiple projects at Dynamic Eye Technology, across web development, mobile development and AI solutions.",
      points: [
        "Own the project plan, task breakdown and delivery across the team.",
        "Manage several projects at once across web development, mobile development and AI solutions.",
        "Review technical specifications, run gap analysis and turn open questions into clear client clarifications."
      ]
    },
    {
      id: "senior",
      role: "Senior Developer",
      years: "2023 – 2024",
      text: "Backend and web development in Go and Python.",
      points: [
        "Built backend services in Go and Python (FastAPI).",
        "Delivered server-rendered web apps with HTMX, Tailwind and SQLAlchemy, on SQLite and PostgreSQL."
      ]
    },
    {
      id: "da",
      role: "Python Developer (Data Analysis)",
      years: "2019 – 2023",
      text: "Moved from Excel and Power BI to Python and Streamlit, which became the turning point of my career in data and web development.",
      points: [
        "Collected data from multiple sources, including files and databases.",
        "Cleaned and shaped data to meet project requirements.",
        "Analysed data and told the story through interactive dashboards."
      ]
    },
    {
      id: "py",
      role: "Python Developer",
      years: "2016 – 2018",
      text: "Built web apps with Django and desktop apps with PyQt5.",
      points: [
        "Led the team by splitting work across back-end, front-end, unit tests, QA and deployment.",
        "Turned client requirements into features and functions.",
        "Reviewed the project at every phase, and ran unit tests and QA.",
        "Supervised deployment to servers and standalone machines."
      ]
    },
    {
      id: "it",
      role: "IT Support",
      years: "2012 – 2014",
      text: "My first IT job, where I learned computers, networks and servers hands-on.",
      points: [
        "Formatted machines and installed operating systems (Windows, Linux) and software.",
        "Network maintenance and troubleshooting.",
        "Server hardware and software maintenance."
      ]
    }
  ],

  /* Projects: leave a field empty ("") to hide it on the card. */
  projects: [
    {
      title: "Dynamic Eye Technology",
      key: "dynamic-eye-technology",
      logo: "eye",
      exp: "pm",
      start: "2024", end: "Present",
      tech: [],
      role: "Project manager",
      desc: "Project manager for multiple projects at Dynamic Eye Technology, across web development, mobile development and AI solutions.",
      /* Areas of work, shown as tiles. icon: web, mobile or ai. */
      appsTitle: "Areas of work",
      apps: [
        { name: "Web development", kind: "Projects managed", icon: "web", text: "Web projects, managed from plan to delivery." },
        { name: "Mobile development", kind: "Projects managed", icon: "mobile", text: "Mobile application projects, managed from plan to delivery." },
        { name: "AI solutions", kind: "Projects managed", icon: "ai", text: "AI solution projects, managed from plan to delivery." }
      ],
      tasks: ["Project planning and task breakdown", "Technical specification review and gap analysis", "Delivery across web, mobile and AI projects"],
      hue: 285
    },
    {
      title: "ITcc",
      key: "itcc",
      exp: "pm",
      start: "", end: "",
      tech: ["PostgreSQL"],
      role: "Project manager",
      desc: "ITcc is an internal IT command and control system, a web app that lets the IT administrator audit all the systems: servers, PCs, NAS, network, Active Directory, replication and failover clusters. It has a logging system and reports, and it runs on PostgreSQL.",
      /* Areas of work: the systems ITcc audits, plus its logging and reports. icon: server, pc, db, network, shield, async or report. */
      appsTitle: "Areas of work",
      apps: [
        { name: "Servers", kind: "Audited", icon: "server", text: "Audited from the ITcc web app." },
        { name: "PCs", kind: "Audited", icon: "pc", text: "Audited from the ITcc web app." },
        { name: "NAS", kind: "Audited", icon: "db", text: "Audited from the ITcc web app." },
        { name: "Network", kind: "Audited", icon: "network", text: "Audited from the ITcc web app." },
        { name: "Active Directory", kind: "Audited", icon: "shield", text: "Audited from the ITcc web app." },
        { name: "Replication and failover clusters", kind: "Audited", icon: "async", text: "Audited from the ITcc web app." },
        { name: "Logging and reports", kind: "Built into ITcc", icon: "report", text: "The logging system and the reports for the IT administrator." }
      ],
      tasks: ["Auditing servers, PCs and NAS", "Auditing the network and Active Directory", "Auditing replication and failover clusters", "Logging system", "Reports for the IT administrator", "PostgreSQL database"],
      /* Extra sections shown on the project page, each a title and a list of points. A section with no points stays hidden. */
      sections: [
        { title: "Reliability", points: [
          "Alerting on failures.",
          "Logging with retention and cleanup.",
          "Database backups and maintenance.",
          "Scheduled health checks and audits."
        ] },
        { title: "Scale and results", points: [
          "Audited about 50 to 200 servers, PCs and devices.",
          "Solved in production: failures in the cluster, replication and servers going unnoticed.",
          "Solved in production: slow or missing reports.",
          "Solved in production: lost or hard-to-trace logs."
        ] }
      ],
      hue: 190
    },
    {
      title: "Market data tracker",
      key: "market-data-tracker",
      exp: "senior",
      start: "", end: "",
      tech: ["Python", "SQLite", "yfinance"],
      role: "Developer",
      desc: "Tracks commodities and currency rates, stores history in SQLite and computes a custom value index. Built as small modules for fetching, storage, analysis and display.",
      tasks: ["Data fetching from market and FX APIs", "SQLite persistence", "Analysis and reporting"],
      hue: 160
    },
    {
      title: "Google Alerts to Excel",
      key: "google-alerts-to-excel",
      exp: "da",
      start: "2022", end: "2023",
      tech: ["Go", "Gmail API", "OAuth2", "goquery", "excelize"],
      role: "Developer",
      desc: "An internal Go tool for specific areas of interest. It collects Google Alerts through the Gmail API and web scraping, sorts each record into a preselected list of categories, and exports the result to Excel sheets for later use.",
      tasks: ["OAuth2 Gmail integration", "HTML parsing with goquery", "Sorting records into a preselected list of categories", "Excel export with excelize", "Logging and alerts"],
      hue: 200
    },
    {
      title: "Content management platform",
      key: "content-management-platform",
      exp: "solo",
      start: "", end: "",
      tech: ["Python", "FastAPI", "HTMX", "Tailwind", "Jinja2", "SQLAlchemy", "PostgreSQL"],
      role: "Full-stack developer",
      desc: "Server-rendered web apps and a CMS built with FastAPI, HTMX and Tailwind, moving from SQLite to PostgreSQL as they grow.",
      tasks: ["Back-end and data model", "HTMX front-end", "Deployment"],
      hue: 265
    },
    {
      title: "SanctiCore",
      key: "sancticore",
      exp: "solo",
      start: "Jun 2026", end: "Aug 2026",
      tech: ["React", "TypeScript", "Vite", "Tailwind", "PostgreSQL", "Deno"],
      role: "Project manager",
      desc: "An internal sanctions-list management platform. It ingests, deduplicates and exposes a searchable database of sanctioned individuals and entities from official sources: OFAC (US), UN Security Council, UK HMT, Australia DFAT and the EU.",
      appsTitle: "Areas of work",
      apps: [
        { name: "Search", kind: "Feature", icon: "web", text: "Full-text search across individuals, entities, vessels and aircraft, with Arabic and Latin transliteration and fuzzy matching." },
        { name: "Screening", kind: "Feature", icon: "report", text: "Screen a pasted or uploaded list of names, or entities extracted from a PDF, against the database in one run." },
        { name: "Admin dashboard", kind: "Feature", icon: "shield", text: "Ingestion control, source health monitoring, audit log and analytics, with role-based access." },
        { name: "Source ingestion", kind: "Built into SanctiCore", icon: "async", text: "Scheduled polling of each official list: OFAC every 4 hours, the others daily." }
      ],
      tasks: ["Project planning and task breakdown", "Delivery of the search, screening and admin features", "Scheduled ingestion and deduplication of sanctions lists", "PostgreSQL database (Supabase)"],
      hue: 25
    },
    {
      title: "Task management & organizer",
      key: "task-management-organizer",
      exp: "da",
      start: "Feb 2021", end: "Jun 2021",
      tech: ["Python", "Plotly", "pandas", "SQL Server", "HTML/CSS", "JavaScript", "Streamlit"],
      role: "Tech lead",
      desc: "A to-do system for each department. Every user has a profile with daily, done and pending tasks and can notify a supervisor on completion. Supervisors can trace and audit every task.",
      tasks: ["Project management", "Back-end and front-end", "QA and debugging"],
      hue: 320
    },
    {
      title: "Portfolio (Streamlit)",
      key: "portfolio-streamlit",
      exp: "solo",
      start: "Sep 2022", end: "Sep 2022",
      tech: ["Python", "Streamlit", "HTML/CSS", "Bootstrap"],
      role: "Full-stack developer",
      desc: "The first version of this portfolio, built with Streamlit to introduce myself and the experience I gathered over my career.",
      tasks: ["Back-end and front-end", "QA and debugging"],
      hue: 10
    },
    {
      title: "Job detection",
      key: "job-detection",
      exp: "py",
      start: "Feb 2018", end: "May 2018",
      tech: ["Python", "RegExp", "BeautifulSoup", "pandas"],
      role: "Python developer",
      desc: "A daily job-alert system: scrapes job listings matching a chosen title, saves links and details as a dataframe, and emails them as an Excel file.",
      tasks: ["Back-end architecture", "Advanced text search", "Debugging"],
      hue: 190
    },
    {
      title: "DCP",
      key: "dcp",
      exp: "py",
      start: "May 2017", end: "Jul 2017",
      tech: ["Python", "RegExp"],
      role: "Python developer",
      desc: "Automates a daily copy task: when a USB drive is plugged in, the tool detects it and copies preselected file types to a chosen destination.",
      tasks: ["Back-end", "Debugging"],
      hue: 90
    },
    {
      title: "LSE",
      key: "lse",
      exp: "py",
      start: "Jan 2017", end: "Mar 2017",
      tech: ["Python", "RegExp", "PyQt5"],
      role: "Junior developer",
      desc: "A local search engine for words inside PDF, TXT and Word documents. Users pick words, file type and folder, then read matching files with the matches highlighted.",
      tasks: ["Front-end and back-end architecture", "Full-text search", "Debugging"],
      hue: 230
    }
  ],

  /* Projects with exp: "solo" appear under this heading on the Experience page. */
  independent: { id: "solo", title: "Independent projects", text: "Built on my own time, outside my job roles." },

  /* Skills: no self-rated levels. Each skill shows its evidence on the Resume page, worked out from the projects and roles above
     (where its name appears in a project's `tech` or a role's text) plus the engineering examples that list it. Add a second
     entry, [name, "evidence"], to write the evidence yourself. */
  skills: [
    { cat: "Languages", items: [["Go"], ["Python"], ["JavaScript / TypeScript"], ["SQL"], ["PHP"]] },
    { cat: "Back-end", items: [["FastAPI"], ["Django"], ["Node.js / Express"], ["REST & JWT auth"], ["Streamlit"], ["PyQt5"]] },
    { cat: "Front-end", items: [["HTML / CSS"], ["HTMX"], ["Tailwind / Bootstrap"], ["React / Vite"], ["Three.js"]] },
    { cat: "Databases", items: [["PostgreSQL"], ["SQLite"], ["SQL Server"], ["MySQL"]] },
    { cat: "Blockchain", items: [["Go blockchain development"], ["Liquidity pool backends"], ["Node API integration"]] },
    { cat: "Data & intelligence", items: [["pandas / EDA"], ["Visualization (Plotly, Power BI)"], ["Web scraping & automation"], ["OSINT tooling"], ["Local LLMs / RAG"]] },
    { cat: "Tools", items: [["Git"], ["Linux"], ["VS Code / code-server"], ["Locust load testing"], ["Jupyter / Colab"]] },
    /* Management: `group` puts these four cards under one "Management" chip in the filter. */
    { cat: "Planning & delivery", group: "Management", items: [["Project planning", "Project Manager, Dynamic Eye Technology (2024 – Present)"], ["Task breakdown", "Project Manager, Dynamic Eye Technology (2024 – Present)"], ["Milestone & delivery tracking", "Delivery across the team as Project Manager (2024 – Present)"], ["ClickUp"]] },
    { cat: "Team leadership", group: "Management", items: [["Team leadership", "Project Manager (2024 – Present); project manager over the ITcc team; tech lead on Task management & organizer (2021)"], ["Task assignment", "Splitting work across back-end, front-end, QA and deployment (Python Developer, 2016 – 2018)"], ["Cross-team coordination (web, mobile, AI)", "Several projects at once across web, mobile and AI (Dynamic Eye Technology, 2024 – Present)"]] },
    { cat: "Requirements & stakeholders", group: "Management", items: [["Specification review", "Project Manager, Dynamic Eye Technology (2024 – Present)"], ["Gap analysis", "Project Manager, Dynamic Eye Technology (2024 – Present)"], ["Client clarification", "Project Manager, Dynamic Eye Technology (2024 – Present)"]] },
    { cat: "Quality & risk", group: "Management", items: [["Load-test coordination"], ["Postmortems"], ["Disaster recovery planning"]] }
  ],

  languages: [
    ["Arabic", "Native"],
    ["English", "Excellent reading and speaking, good writing"],
    ["French", "Intermediate"]
  ],

  /* Engineering examples: real work behind the skills. Each one says what the system was, what I personally did,
     what went wrong and what changed. `project` links it to a project; `skills` are the skills it is evidence for.
     System and employer names are left out on purpose. Only add what is true, and numbers only if you have them. */
  examples: [
    {
      id: "db-concurrency",
      short: "SQLite → PostgreSQL move",
      title: "Moving a content management platform from SQLite to PostgreSQL",
      topic: "Database concurrency and production reliability",
      context: "Independent project",
      project: "content-management-platform",
      skills: ["PostgreSQL", "SQLite"],
      system: "A content management platform (FastAPI, SQLAlchemy) used by about 5 people at first and about 20 later. I built it alone, and a second developer joined later.",
      responsibility: "I moved the database from SQLite to PostgreSQL and added indexes. The second developer helped with development and with reviewing the logs.",
      problem: "When several people saved at the same time, the app sometimes returned \"database is locked\" errors and timeouts. SQLite allows only one write at a time, so the other writes had to wait.",
      outcome: "After the move and the new indexes, the lock errors and timeouts became rare.",
      proof: "Server logs and user feedback."
    },
    {
      id: "background-jobs",
      short: "Google Alerts collector",
      title: "A Google Alerts collector that stopped failing silently",
      topic: "Reliable background execution",
      context: "Internal job, 2022 – 2023",
      project: "google-alerts-to-excel",
      skills: ["Web scraping & automation", "Go"],
      system: "An internal Go tool for specific areas of interest. It collects Google Alerts, sorts each record into a preselected list of categories, and exports the result to Excel every week.",
      responsibility: "I built the tool, including its logging and alerts.",
      problem: "Early on it failed silently, crashed, and produced duplicate records.",
      outcome: "After I added logging and alerts, the weekly exports came out correct and the logs showed no errors.",
      proof: "The weekly exports and the logs."
    },
    {
      id: "production-reliability",
      short: "ITcc reliability",
      title: "Keeping an IT command and control system reliable in production",
      topic: "Production reliability",
      context: "Internal project",
      project: "itcc",
      skills: ["PostgreSQL"],
      system: "ITcc, an internal IT command and control web app on PostgreSQL. It lets the IT administrator audit servers, PCs, NAS, the network, Active Directory, and replication and failover clusters, with a logging system and reports. It covered about 50 to 200 devices.",
      responsibility: "I was the project manager over the team that built it. The team put in place alerting on failures, logging with retention and cleanup, database backups and maintenance, and scheduled health checks and audits.",
      problem: "In production, failures in the cluster, replication and servers went unnoticed, reports were slow or missing, and logs were lost or hard to trace.",
      outcome: "All three problems were solved in production."
    }
  ],

  /* Technical leadership: categories from Technical_Qualifications_By_Category.xlsx,
     keeping only the qualifications I confirmed. `tags` are optional details, `status` marks something in progress. */
  leadership: [
    { cat: "Application development", icon: "app", items: [
      { name: "Python / FastAPI", tags: ["backend systems"] } ] },
    { cat: "Database and concurrency", icon: "db", items: [
      { name: "PostgreSQL", tags: ["transaction isolation", "deadlocks", "advisory locks", "connection pools", "query contention"], example: "db-concurrency" },
      { name: "SQL Server" } ] },
    { cat: "Asynchronous processing", icon: "async", items: [
      { name: "Kafka", tags: ["event streaming"], status: "Currently learning" },
      { name: "Windows Task Scheduler", tags: ["scheduled jobs"] } ] },
    { cat: "Deployment and infrastructure", icon: "infra", items: [
      { name: "Kubernetes", tags: ["containerized deployment"] },
      { name: "Docker" } ] },
    { cat: "Visibility and troubleshooting", icon: "eye", items: [
      { name: "Troubleshooting" } ] },
    { cat: "Reliability and operations", icon: "shield", items: [
      { name: "Hyper-V" },
      { name: "Windows failover clustering", tags: ["high availability"] },
      { name: "Disaster recovery" },
      { name: "Load testing", tags: ["Locust"] },
      { name: "Postmortems" } ] }
  ],

  /* Delivery roadmap: the centrepiece of the Home page, a dial that fills up one step at a time, phase by phase.
     Change the names, the number of steps per phase (`blocks`) or the colours here. */
  delivery: {
    title: "Delivery roadmap",
    phases: [
      { name: "Spec", blocks: 3, color: "#f2a541" },
      { name: "Build", blocks: 4, color: "#7cc7b4" },
      { name: "Test", blocks: 3, color: "#a594e0" },
      { name: "Ship", blocks: 2, color: "#7fd4ff" }
    ]
  },

  links: [
    { id: "email", label: "Email me", sub: "testdevleb@gmail.com", url: "mailto:testdevleb@gmail.com" },
    { id: "linkedin", label: "LinkedIn", sub: "georges-matta", url: "https://www.linkedin.com/in/georges-matta-2a62a217b/" },
    { id: "github", label: "GitHub", sub: "devleb", url: "https://github.com/devleb" },
    { id: "stackoverflow", label: "Stack Overflow", sub: "devleb2022", url: "https://stackoverflow.com/users/5980666/devleb2022" },
    { id: "x", label: "X (Twitter)", sub: "@matta_georges", url: "https://twitter.com/matta_georges/" },
    { id: "medium", label: "Medium", sub: "@testdevleb", url: "https://medium.com/@testdevleb" }
  ],

  blogs: [
    {
      title: "My journey in learning data analysis (self-teaching)",
      img: "blog1",
      date: "Medium",
      excerpt:
        "My first story on Medium. After years of learning from data analysts and programmers there, I decided to share what I learned in three years in the field: the difficulties that hit you during analysis on the way to the result you need. I hope it helps anyone starting data analysis, and machine learning later on.",
      url: "https://medium.com/@testdevleb/my-journey-in-learning-data-analysis-7c6b45f3c472"
    }
  ]
};
