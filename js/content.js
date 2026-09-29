/* ==========================================================================
   Portfolio content — edit this file to update the site.
   Everything shown on the pages comes from here.
   ========================================================================== */

window.ASSETS = {
  profile: "assets/img/profile.jpg",
  blog1: "assets/img/blog-data-analysis.jpg",
  cv: "assets/cv/Georges-Matta-CV.pdf",
  cvFileName: "Georges-Matta-CV.pdf"
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
      "I build backends in Go and Python, blockchain infrastructure, and intelligence tools that turn scattered data into clear decisions. I hold a BSc in Computer Science and currently manage the team behind the Egety blockchain.",
    focus: [
      {
        title: "Backend systems",
        text: "APIs and services in Go and Python (FastAPI), backed by PostgreSQL, SQLite and SQL Server.",
        tech: ["Go", "FastAPI", "PostgreSQL"]
      },
      {
        title: "Blockchain",
        text: "A custom Go blockchain, liquidity pool and mining backends, node API integrations and load testing.",
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
      role: "Project Manager — Egety blockchain",
      years: "2024 – Present",
      text: "Leading the team that builds Egety, a custom blockchain written in Go, from technical specification to delivery.",
      points: [
        "Own the project plan, task breakdown and delivery across the team.",
        "Review technical specifications, run gap analysis and turn open questions into clear client clarifications.",
        "Oversee the Go backend work: liquidity pool, mining services and node API integrations.",
        "Coordinate load testing with Locust."
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
      title: "Egety blockchain",
      key: "egety-blockchain",
      exp: "pm",
      start: "2024", end: "Present",
      tech: ["Go", "SQLite", "Locust", "NowNodes API"],
      role: "Project manager",
      desc: "A custom blockchain written in Go with a fixed 10M coin supply, a liquidity pool backend and an LTC mining backend.",
      tasks: ["Technical specification review and gap analysis", "Liquidity pool and mining services", "Node API integration", "Load testing with Locust"],
      hue: 38
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
      exp: "senior",
      start: "", end: "",
      tech: ["Go", "Gmail API", "OAuth2", "goquery", "excelize"],
      role: "Developer",
      desc: "A Go tool that collects Google Alerts through the Gmail API and web scraping, then exports them to structured Excel sheets.",
      tasks: ["OAuth2 Gmail integration", "HTML parsing with goquery", "Excel export with excelize"],
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

  /* Skills: level is 0–100. Shown as an interactive chart on the Resume page. */
  skills: [
    { cat: "Languages", items: [["Go", 85], ["Python", 90], ["JavaScript / TypeScript", 65], ["SQL", 80], ["PHP", 50]] },
    { cat: "Back-end", items: [["FastAPI", 85], ["Django", 80], ["Node.js / Express", 60], ["REST & JWT auth", 80], ["Streamlit", 90], ["PyQt5", 70]] },
    { cat: "Front-end", items: [["HTML / CSS", 80], ["HTMX", 75], ["Tailwind / Bootstrap", 75], ["React / Vite", 55], ["Three.js", 60]] },
    { cat: "Databases", items: [["PostgreSQL", 75], ["SQLite", 85], ["SQL Server", 80], ["MySQL", 70]] },
    { cat: "Blockchain", items: [["Go blockchain development", 75], ["Liquidity pool backends", 70], ["Node API integration", 70]] },
    { cat: "Data & intelligence", items: [["pandas / EDA", 85], ["Visualization (Plotly, Power BI)", 80], ["Web scraping & automation", 90], ["OSINT tooling", 80], ["Local LLMs / RAG", 60]] },
    { cat: "Tools", items: [["Git", 70], ["Linux", 70], ["VS Code / code-server", 85], ["Locust load testing", 65], ["Jupyter / Colab", 90]] }
  ],

  languages: [
    ["Arabic", "Native"],
    ["English", "Excellent reading and speaking, good writing"],
    ["French", "Intermediate"]
  ],

  /* Technical leadership: categories from Technical_Qualifications_By_Category.xlsx,
     keeping only the qualifications I confirmed. `tags` are optional details, `status` marks something in progress. */
  leadership: [
    { cat: "Application development", icon: "app", items: [
      { name: "Python / FastAPI", tags: ["backend systems"] } ] },
    { cat: "Database and concurrency", icon: "db", items: [
      { name: "PostgreSQL", tags: ["transaction isolation", "deadlocks", "advisory locks", "connection pools", "query contention"] },
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
