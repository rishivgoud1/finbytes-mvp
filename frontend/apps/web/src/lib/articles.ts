// ============================================
// ARTICLE DATA & TYPES FOR FINBYTES
// ============================================

export type Product = "Finbytes of the Day" | "Decode" | "Strategy Room" | "Power Desk" | "Editorial";
export type View = "home" | "article" | "fotd" | "decode" | "strategy-room" | "power-desk" | "editorial" | "about";

export interface PullQuote {
  type: "pullquote";
  text: string;
}

export interface Article {
  id: number;
  slug: string;  // ← ADD THIS (was missing before)
  product: Product;
  tag?: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  author: string;
  authorTitle: string;
  date: string;
  readTime: string;
  image: string;
  videoId?: string;
  body: (string | PullQuote)[];
}

export interface Video {
  id: string;
  videoId: string;
  title: string;
  duration: string;
  date: string;
  thumbnail: string;
  category?: string;
}

// ============================================
// ARTICLE DATA
// ============================================

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: "the-fed-holds-markets-surge",
    product: "Finbytes of the Day",
    tag: "TODAY'S EDITION",
    title: "The Fed Holds. Markets Surge. And Why the Real Story Is What Comes Next.",
    subtitle: "A rate pause is priced in — but the next six months could reshape every asset class on the board",
    excerpt: "In today's edition: The Federal Reserve's extended pause sends equities to 14-month highs, AI infrastructure spending hits a new record, and the quiet restructuring of Southeast Asia's economy.",
    author: "Isabelle Thornton",
    authorTitle: "Senior Markets Correspondent",
    date: "June 9, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1761233138997-44d9b002a08f?w=1400&h=800&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Good morning. Today's Finbytes covers three stories that, at first glance, look unrelated — but together, they tell a coherent story about how capital is being redeployed in 2026.",
      "First: the Federal Reserve. Chair Powell's signal of an extended rate pause is, on the surface, bullish. Markets responded accordingly — the S&P 500 closed at 5,847, up 2.3%. But sophisticated investors are watching something else: the shape of the yield curve and what it implies about terminal rate expectations heading into 2027.",
      {
        type: "pullquote" as const,
        text: "\"The data has evolved in ways that give us more confidence. We are not in a rush to adjust our policy stance.\" — Jerome Powell, Fed Chair",
      },
      "Second: AI infrastructure. Microsoft, Google, and Amazon have collectively committed over $150 billion to data center construction this year alone. The constraint is no longer chip supply — it is power. Whoever controls the energy grid controls the AI economy.",
      "Third: Southeast Asia. Quietly, methodically, a coalition of ASEAN economies is executing an industrial policy playbook that Western democracies struggle to replicate. Vietnam's semiconductor sector, Indonesia's battery supply chain, and the Philippines' enterprise software exports are converging into something genuinely new.",
      "These three stories share a common thread: the reallocation of long-term capital toward infrastructure that takes decades to build and decades to obsolete. That is the defining investment theme of the 2020s. Don't lose sight of it in the noise of daily price action.",
    ],
  },
  {
    id: 2,
    slug: "inside-anthropic-long-game",
    product: "Decode",
    title: "Inside Anthropic's Long Game: Why the AI Safety Company Keeps Turning Down Easy Revenue",
    subtitle: "While rivals race to monetize, Anthropic continues to bet that the companies that solve alignment will also win the market",
    excerpt: "While rivals race to monetize, Anthropic continues to bet that the companies that solve alignment will also win the market. The strategy is unconventional. It might be working.",
    author: "Priya Gupta",
    authorTitle: "AI Correspondent",
    date: "June 8, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?w=800&h=500&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "In a conference room overlooking San Francisco Bay, Dario Amodei is explaining, with characteristic precision, why Anthropic recently walked away from a $2 billion enterprise contract. The potential customer, a major financial institution, had wanted to deploy Claude for a use case that Anthropic's policy team had flagged as potentially increasing systemic risk in credit markets.",
      "\"We had a long conversation about it,\" Amodei says. \"And we decided the answer was no. Not because we don't need the revenue — we do — but because if we say yes to things we shouldn't say yes to, we become the thing we were built to prevent.\"",
      {
        type: "pullquote" as const,
        text: "Safety and capability are not in tension. The models that are hardest to misuse are often the most powerful — because they can be deployed in higher-stakes environments.",
      },
      "The decision is emblematic of an Anthropic that is, by every conventional metric, leaving money on the table. And yet the company closed 2025 with $4.2 billion in annualized revenue, nearly tripling the figure from the year before, and its enterprise customer list now includes some of the world's most risk-averse institutions — precisely because of its reputation for principled refusals.",
      "The strategy relies on a bet that most of the AI industry considers naively optimistic: that safety and commercial success are not just compatible, but causally linked. Anthropic's theory is that the enterprises most worth having as customers — governments, financial institutions, healthcare systems — are also the ones most sensitive to risk. And those customers, the theory goes, will pay a premium for an AI provider they trust not to get them into trouble.",
    ],
  },
  {
    id: 3,
    slug: "150-billion-ai-infrastructure-bet",
    product: "Decode",
    title: "The $150 Billion AI Infrastructure Bet: Why Tech Giants Are Racing to Build Data Centers",
    subtitle: "From the Nevada desert to Singapore, a global construction boom is reshaping the power grid",
    excerpt: "Microsoft, Google, and Amazon have collectively committed over $150 billion to AI infrastructure this year alone — a bet that the current AI boom has decades of runway left.",
    author: "Derek Osei",
    authorTitle: "Technology Editor",
    date: "June 7, 2026",
    readTime: "11 min read",
    image: "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=1200&h=700&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Drive through the Nevada desert on US Route 95 north of Las Vegas, and you will see the future taking shape in concrete and steel. Sprawling across thousands of acres, Microsoft's Apex Data Campus is a $12 billion construction project that, when complete in 2028, will consume more electricity than the entire state of Vermont.",
      "It is just one node in an unprecedented global infrastructure buildout. Microsoft, Google, Amazon, and Meta have collectively committed over $150 billion to AI-related capital expenditure in 2026 alone — a figure that dwarfs the GDP of many mid-sized nations.",
      {
        type: "pullquote" as const,
        text: "We are entering the age of infinite computing — the constraint is no longer code or talent, but the physical infrastructure to run the models. Whoever owns the infrastructure owns the future.",
      },
      "Power is emerging as the critical bottleneck. Each new generation of AI accelerator chips draws significantly more electricity than its predecessor — Nvidia's latest Blackwell Ultra architecture consumes roughly 2.4 kilowatts per chip, compared to 700 watts for the H100s that powered the first wave of generative AI.",
      "This has set off a frantic race for energy assets. Microsoft has restarted the Three Mile Island nuclear plant in Pennsylvania, entered into power purchase agreements covering more than 60 gigawatts of new renewable capacity globally, and is exploring advanced geothermal projects in Iceland and the Philippines.",
    ],
  },
  {
    id: 4,
    slug: "sarah-chen-meridian-capital",
    product: "Strategy Room",
    title: "How Sarah Chen Rebuilt Meridian Capital After Its Near-Collapse",
    subtitle: "The first female CEO of a top-10 hedge fund on crisis, resilience, and the myth of the infallible leader",
    excerpt: "When Meridian Capital lost 34% of its value in six weeks in 2024, most observers expected Sarah Chen to resign. Instead, she did something far more difficult.",
    author: "James Whitfield",
    authorTitle: "Profiles Editor",
    date: "June 6, 2026",
    readTime: "14 min read",
    image: "https://images.unsplash.com/photo-1600896997793-b8ed3459a17f?w=1200&h=700&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Sarah Chen remembers the exact moment she knew Meridian Capital was in genuine danger. It was a Tuesday afternoon in September 2024, and she was in the middle of a risk committee meeting when her phone lit up with a message from the firm's head of prime brokerage: three major counterparties were calling their margin simultaneously.",
      "\"I looked around the room,\" she recalls, \"and I thought: these people are looking to me to tell them it's going to be fine. And I genuinely did not know if it was.\"",
      {
        type: "pullquote" as const,
        text: "\"The biggest lie in business is that great leaders always have the answer. True leadership is about creating the conditions for the right answer to emerge — even when you don't have it yourself.\"",
      },
      "What followed was 72 hours that will be studied in business schools for decades. Chen made a series of decisions that defied conventional hedge fund wisdom: she was transparently candid with investors about the extent of the losses, she personally called each of the firm's 40 largest limited partners before the news leaked.",
      "Meridian lost $8.4 billion in assets under management over that six-week period. But it survived. And over the subsequent 18 months, it recovered nearly all of those outflows, closing 2025 up 28.3%.",
    ],
  },
  {
    id: 5,
    slug: "asean-economic-restructuring",
    product: "Power Desk",
    title: "The Quiet Restructuring of ASEAN: How Southeast Asia Is Rewriting Its Economic Rules",
    excerpt: "From Vietnam's semiconductor push to Indonesia's battery supply chain, the region is executing a coordinated industrial policy that Western leaders are struggling to match.",
    author: "Caroline Baptiste",
    authorTitle: "Asia Correspondent",
    date: "June 5, 2026",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1647510283846-ed174cc84a78?w=800&h=500&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "In Hanoi, a new semiconductor fabrication facility rises from what was paddy fields just three years ago. In Batam, Indonesia, workers are assembling lithium-iron phosphate battery packs destined for European electric vehicles. In Manila, a new generation of software engineers is building the enterprise tools that mid-size US companies will use to run their operations.",
      "Southeast Asia is undergoing a profound economic transformation — one that is less dramatic than China's rise but potentially more durable, precisely because it is being engineered through a patchwork of national industrial strategies rather than a single central plan.",
      {
        type: "pullquote" as const,
        text: "ASEAN is not trying to be the next China. It is trying to be something the world has never seen: a coalition of sovereign industrial policies that compete and cooperate simultaneously.",
      },
      "The transformation is being driven by several converging forces: the global decoupling from China, the energy transition's insatiable demand for battery metals, the nearshoring of manufacturing supply chains, and a generation of technocratic leaders who have studied the East Asian development playbook and are applying it with 21st-century tools.",
    ],
  },
  {
    id: 6,
    slug: "phantom-energy-fusion",
    product: "Power Desk",
    title: "Phantom Energy Raises $340M to Commercialize Fusion Power by 2030",
    excerpt: "The Berkeley-based startup claims a breakthrough in plasma containment that could cut fusion commercialization timelines by a decade.",
    author: "Riya Nair",
    authorTitle: "Energy & Climate Reporter",
    date: "June 4, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1560221328-12fe60f83ab8?w=800&h=500&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Phantom Energy, the Berkeley-based fusion startup founded by former MIT plasma physicists, announced today it has closed a $340 million Series D funding round led by Breakthrough Energy Ventures and joined by Saudi Aramco Energy Ventures and Temasek Holdings.",
      "The capital will be used to construct Phantom's first commercial-scale fusion demonstration plant in the Nevada desert, with a target grid connection date of Q4 2030.",
      {
        type: "pullquote" as const,
        text: "We have solved the confinement problem. What remains is engineering, not physics. And engineering is something we know how to fund. — Dr. Amara Singh, Phantom Energy CEO",
      },
      "The funding round values Phantom at $2.1 billion, up from the $780 million valuation it commanded when it raised its Series C in late 2024.",
    ],
  },
  {
    id: 7,
    slug: "sovereign-ai-race",
    product: "Decode",
    title: "The Sovereign AI Race: How Nation-States Are Building Closed Models",
    subtitle: "Governments from Beijing to Brussels are funding classified language models — and the implications for open research are profound",
    excerpt: "A new wave of state-sponsored AI programs is quietly diverging from the open research ecosystem, creating sovereign models that will never be publicly released.",
    author: "Derek Osei",
    authorTitle: "Technology Editor",
    date: "June 7, 2026",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Governments around the world are building their own AI models.",
      "The implications for open research are profound.",
      {
        type: "pullquote" as const,
        text: "The next frontier is sovereign AI — models that serve national interest, not commercial imperatives.",
      },
    ],
  },
  {
    id: 8,
    slug: "private-credit-reckoning",
    product: "Decode",
    title: "Private Credit's $2.5 Trillion Reckoning: The Risks Nobody Is Pricing",
    subtitle: "Covenant-lite structures dominate 78% of new issuances. When the cycle turns, it will turn fast.",
    excerpt: "The private credit market has grown faster than anyone anticipated — and the systemic risks that come with covenant-lite lending are only now coming into focus.",
    author: "Priya Gupta",
    authorTitle: "AI Correspondent",
    date: "June 6, 2026",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "The private credit market has expanded dramatically.",
      "Covenant-lite structures now dominate 78% of new issuances.",
      {
        type: "pullquote" as const,
        text: "When the cycle turns, it will turn fast — and most allocators are not positioned for the speed of that unwind.",
      },
    ],
  },
  {
    id: 9,
    slug: "fusion-bet-strategic-capital",
    product: "Decode",
    title: "Inside the Fusion Bet: Why Strategic Capital Is Finally Getting Serious",
    excerpt: "After 70 years of 'always 20 years away', fusion is attracting the kind of capital that historically has only followed commercialization certainty.",
    author: "Riya Nair",
    authorTitle: "Energy & Climate Reporter",
    date: "June 5, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1560221328-12fe60f83ab8?w=800&h=500&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Fusion has attracted serious institutional capital.",
      "The Phantom Energy round is a signal — not a fluke.",
      {
        type: "pullquote" as const,
        text: "We are not betting on the physics. The physics is solved. We are betting on the engineering timeline.",
      },
    ],
  },
  {
    id: 10,
    slug: "72-hour-crisis-protocol",
    product: "Strategy Room",
    title: "The 72-Hour Crisis Protocol: How Elite CEOs Structure Their Response",
    subtitle: "From hedge fund blow-ups to product recalls, the first three days determine everything",
    excerpt: "The leaders who survive crises intact share a counter-intuitive first move: they slow down before they speed up.",
    author: "James Whitfield",
    authorTitle: "Profiles Editor",
    date: "June 8, 2026",
    readTime: "11 min read",
    image: "https://images.unsplash.com/photo-1600896997793-b8ed3459a17f?w=800&h=500&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Great crisis leaders share one trait: they resist the urge to act immediately.",
      "The 72-hour window is decisive.",
      {
        type: "pullquote" as const,
        text: "The biggest mistake I see is leaders confusing activity with progress in the first 72 hours.",
      },
    ],
  },
  {
    id: 11,
    slug: "capital-allocation-scale",
    product: "Strategy Room",
    title: "Capital Allocation at Scale: The Mental Models That Actually Work",
    excerpt: "How the CFOs of the world's most capital-efficient companies think about deploying cash across competing priorities.",
    author: "Caroline Baptiste",
    authorTitle: "Asia Correspondent",
    date: "June 6, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1647510283846-ed174cc84a78?w=800&h=450&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Capital allocation is the highest-leverage decision a CEO makes.",
      "Most do it reactively.",
      {
        type: "pullquote" as const,
        text: "Every dollar you deploy is a statement of belief. The question is whether you've made that belief explicit.",
      },
    ],
  },
  {
    id: 12,
    slug: "talent-architecture",
    product: "Strategy Room",
    title: "Talent Architecture: Why the Best Teams Are Built Backwards",
    excerpt: "Starting with culture fit is the wrong first move. The companies with the highest-performing teams start with clarity about what they are actually trying to build.",
    author: "Isabelle Thornton",
    authorTitle: "Senior Markets Correspondent",
    date: "June 4, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Culture fit is a lagging indicator.",
      "The best leaders build teams around clarity of output, not similarity of style.",
      {
        type: "pullquote" as const,
        text: "Culture follows structure. Get the structure right first, and the culture will form around the work.",
      },
    ],
  },
  {
    id: 13,
    slug: "singapore-over-silicon-valley",
    product: "Power Desk",
    title: "Why I Chose Singapore Over Silicon Valley for Our Global HQ",
    subtitle: "A CEO's candid account of the decision that reshaped how we think about talent, capital, and geopolitical risk",
    excerpt: "The move wasn't about tax. It was about positioning a company for a world where Asia is the center of gravity.",
    author: "Rajiv Menon, CEO — NexGenTech",
    authorTitle: "Chief Executive Officer",
    date: "June 9, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1470075801209-17f9ec0cada6?w=900&h=600&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "The decision to move our headquarters was not made in a boardroom.",
      "It was made on a flight from Singapore to Kuala Lumpur.",
      {
        type: "pullquote" as const,
        text: "Asia isn't the future of our business. It is the present — and the West is the emerging market.",
      },
    ],
  },
  {
    id: 14,
    slug: "industrial-policy-playbook",
    product: "Power Desk",
    title: "The Industrial Policy Playbook I Wish I'd Had Ten Years Ago",
    subtitle: "After navigating three government incentive cycles across four continents, here is what actually works",
    excerpt: "Most CEOs treat government relations as a defensive activity. The ones who win treat it as a strategic asset.",
    author: "Amara Okonkwo, CEO — Solstice Energy",
    authorTitle: "Chief Executive Officer",
    date: "June 7, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&h=600&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Government relationships are not a compliance function.",
      "They are a competitive moat.",
      {
        type: "pullquote" as const,
        text: "The companies that understand industrial policy as strategy — not bureaucracy — are the ones capturing the decade.",
      },
    ],
  },
  {
    id: 15,
    slug: "operating-emerging-markets",
    product: "Power Desk",
    title: "On Building a Company in a Country That Doesn't Want You to Succeed",
    subtitle: "A first-person account of operating across three emerging markets simultaneously — and what it teaches you about resilience",
    excerpt: "Regulatory hostility is not an obstacle. Handled correctly, it becomes the highest barrier to entry you could ever build.",
    author: "Liu Wei, CEO — CrossBorder Payments",
    authorTitle: "Chief Executive Officer",
    date: "June 5, 2026",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=600&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Operating in emerging markets requires a different kind of patience.",
      "The friction is the feature.",
      {
        type: "pullquote" as const,
        text: "Every regulation that slowed us down also slowed every potential competitor. We chose to see that clearly.",
      },
    ],
  },
  {
    id: 16,
    slug: "business-intelligence-strategic-moat",
    product: "Editorial",
    title: "Why Business Intelligence Has Become the New Strategic Moat",
    subtitle: "The companies that will define the next decade are not the ones with the most data — they are the ones that synthesize it fastest",
    excerpt: "We built Finbytes because we saw a gap: the smartest people in business were drowning in information and starving for insight.",
    author: "Shashidhar",
    authorTitle: "Founder & CEO, Finbytes",
    date: "June 9, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=700&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "We live in a world of infinite information and finite attention.",
      "The scarcest resource in business is not data — it is synthesis.",
      {
        type: "pullquote" as const,
        text: "Intelligence is not knowing more. Intelligence is connecting the right things faster than anyone else.",
      },
    ],
  },
  {
    id: 17,
    slug: "media-year-two-mistakes",
    product: "Editorial",
    title: "The Mistake Every Ambitious Media Company Makes in Year Two",
    subtitle: "Growth without editorial discipline is how publications lose their voice — and their audience",
    excerpt: "I have watched it happen to publications I admired. I am determined not to let it happen to Finbytes.",
    author: "Shashidhar",
    authorTitle: "Founder & CEO, Finbytes",
    date: "June 2, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=700&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "Year two is when media companies get seduced by scale.",
      "More articles. More writers. More formats. Less clarity.",
      {
        type: "pullquote" as const,
        text: "Every great publication has a point of view. When you scale before you have one, you are building an audience for someone else's idea.",
      },
    ],
  },
  {
    id: 18,
    slug: "audience-building-lessons",
    product: "Editorial",
    title: "What I Got Wrong About Audience Building",
    subtitle: "Three years of building Finbytes has taught me that the audience you want is rarely the audience you initially attract",
    excerpt: "The hardest part of building a media company is not the content. It is knowing which readers you are actually for.",
    author: "Shashidhar",
    authorTitle: "Founder & CEO, Finbytes",
    date: "May 26, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=700&fit=crop&auto=format",
    videoId: "dQw4w9WgXcQ",
    body: [
      "In our first year, we tried to appeal to everyone in business.",
      "That is the fastest way to matter to no one.",
      {
        type: "pullquote" as const,
        text: "Your true audience reveals itself slowly. The discipline is to serve them, not to chase the larger, blurrier group around them.",
      },
    ],
  },
  {
    id: 19,
    slug: "jensen-huang-ceo-powering-ai-revolution",
    product: "Power Desk",
    title: "Jensen Huang — The CEO Powering the AI Revolution",
    subtitle:
      "How two decades of platform thinking turned a graphics card company into the backbone of global artificial intelligence",
    excerpt:
      "Few leaders have influenced the future of technology like NVIDIA CEO Jensen Huang. Once known primarily for gaming graphics cards, NVIDIA has transformed into the backbone of the global AI revolution.",
    author: "Finbytes Power Desk",
    authorTitle: "Market Intelligence",
    date: "August 2, 2026",
    readTime: "3 min read",
    image: "/images/nvidia-jensen-huang.jpeg",
    body: [
      "Few leaders have influenced the future of technology like NVIDIA CEO Jensen Huang. Once known primarily for gaming graphics cards, NVIDIA has transformed into the backbone of the global AI revolution. Its GPUs now power everything from ChatGPT and autonomous vehicles to scientific research and national AI infrastructure.",
      "Huang's strategy has been consistent for over two decades: invest early, think long term, and build platforms rather than products. While competitors focused on short-term gains, NVIDIA quietly built the hardware and software ecosystem that now powers artificial intelligence worldwide.",
      "Today, governments, startups, and Fortune 500 companies depend on NVIDIA's computing power. Huang has proven that technological leadership comes not from following trends but from creating them.",
      {
        type: "pullquote" as const,
        text: "Power Insight: Great leaders don't chase the future — they build the infrastructure that makes the future possible.",
      },
    ],
  },
  {
    id: 20,
    slug: "india-semiconductor-mission-strategic-power",
    product: "Power Desk",
    title: "India's Semiconductor Mission — Building Strategic Power Beyond Software",
    subtitle:
      "After decades of software leadership, India is pursuing the foundation layer of modern technology",
    excerpt:
      "For decades, India became a global leader in software. Today, it is aiming to become a significant player in semiconductors — the foundation of modern technology.",
    author: "Finbytes Power Desk",
    authorTitle: "Market Intelligence",
    date: "August 2, 2026",
    readTime: "3 min read",
    image: "/images/india-chip-modi.jpeg",
    body: [
      "For decades, India became a global leader in software. Today, it is aiming to become a significant player in semiconductors — the foundation of modern technology. Chips power smartphones, electric vehicles, defense systems, AI data centers, and industrial automation, making them a strategic asset for every nation.",
      "Through policy support, global partnerships, and manufacturing investments, India is strengthening its semiconductor ecosystem. The goal is not only to reduce import dependence but also to become a trusted global manufacturing hub.",
      "Success will require skilled talent, resilient supply chains, advanced research, and sustained investment. If executed effectively, the semiconductor mission could redefine India's position in the global technology landscape.",
      {
        type: "pullquote" as const,
        text: "Power Insight: In the digital age, nations that build chips don't just manufacture technology — they shape economic growth, national security, and global influence.",
      },
    ],
  },
  {
    id: 21,
    slug: "fed-holds-rates-what-comes-next",
    product: "Finbytes of the Day",
    tag: "TODAY'S EDITION",
    title:
      "The Fed Held Rates. Markets Rallied. But the Real Story Is What Comes Next.",
    subtitle:
      "A pause gives investors clarity today — the decisions that matter are the ones still ahead",
    excerpt:
      "The Federal Reserve kept interest rates unchanged, giving investors clarity after a period of uncertainty. Markets welcomed it — but the decision is less about today's rally than about what happens next.",
    author: "Finbytes Desk",
    authorTitle: "Daily Briefing",
    date: "August 2, 2026",
    readTime: "3 min read",
    image: "/images/fed-holds-rates.jpeg",
    body: [
      "The Federal Reserve in the United States kept interest rates the same, which brought clarity for investors after a period of not knowing what to expect. The markets welcomed the news. Equities rose because investors concluded that the cost of borrowing may not climb any higher.",
      "But the decision is not really about why markets rose today — it is about what happens tomorrow.",
      "When the Federal Reserve stops moving interest rates, it signals that inflation is improving. Policymakers, however, remain watchful about weaknesses in the wider economy. What happens next with inflation, employment and consumer spending will determine the Fed's following move.",
      {
        type: "pullquote" as const,
        text: "For companies, the task is unchanged: keep balancing investment in growth against discipline with capital.",
      },
    ],
  },
  {
    id: 22,
    slug: "ai-arms-race-competing-for-algorithms",
    product: "Decode",
    title:
      "The AI Arms Race: Why Nations Are Competing for Algorithms, Not Just Weapons",
    subtitle:
      "The defining strategic technology of the century is measured in data, compute and semiconductors",
    excerpt:
      "Artificial Intelligence has become the defining strategic technology of the 21st century. Unlike previous military revolutions driven by firepower, today's competition is centered on data, computing power, semiconductor technology, and advanced algorithms.",
    author: "Finbytes Decode",
    authorTitle: "Analysis Desk",
    date: "August 2, 2026",
    readTime: "4 min read",
    image: "/images/ai-arms-race.jpeg",
    body: [
      "Artificial Intelligence has become the defining strategic technology of the 21st century. Unlike previous military revolutions driven by firepower, today's competition is centered on data, computing power, semiconductor technology, and advanced algorithms.",
      "Governments worldwide are investing billions in autonomous drones, AI-powered surveillance, cyber defense, intelligence analysis, and battlefield decision-support systems. The United States, China, and several European nations view AI as a cornerstone of national security and economic competitiveness.",
      "However, the AI race extends far beyond the military. The country that leads in AI will likely shape global standards, supply chains and economic advantage for a generation.",
      {
        type: "pullquote" as const,
        text: "Finbytes Decode: The contest for advantage has moved from firepower to compute — and the winners will set the rules everyone else follows.",
      },
    ],
  },
  {
    id: 23,
    slug: "new-arms-economy-defense-innovation",
    product: "Decode",
    title:
      "The New Arms Economy: How Defense Innovation Is Reshaping Global Markets",
    subtitle:
      "Military spending is expanding beyond hardware into drones, cyber, satellites and AI systems",
    excerpt:
      "The global defense industry is undergoing a significant transformation. Traditional military spending is expanding beyond tanks, fighter jets, and missiles to include drones, cyber warfare, satellite intelligence, quantum technologies, and AI-enabled defense systems.",
    author: "Finbytes Decode",
    authorTitle: "Analysis Desk",
    date: "August 2, 2026",
    readTime: "4 min read",
    image: "/images/new-arms-economy.jpeg",
    body: [
      "The global defense industry is undergoing a significant transformation. Traditional military spending is expanding beyond tanks, fighter jets, and missiles to include drones, cyber warfare, satellite intelligence, quantum technologies, and AI-enabled defense systems.",
      "Governments are increasing defense budgets in response to geopolitical tensions, creating new opportunities for technology companies and defense startups. Private investment in dual-use technologies — innovations that serve both civilian and military purposes — is also rising rapidly.",
      "This shift is redefining the relationship between national security and economic growth. Countries with strong research ecosystems, advanced manufacturing, and resilient supply chains are better positioned to lead the next generation of defense innovation.",
      {
        type: "pullquote" as const,
        text: "Finbytes Decode: Modern defense is no longer defined solely by weapons. It is increasingly powered by software, artificial intelligence, innovation ecosystems, and strategic partnerships that shape both security and economic influence.",
      },
    ],
  },
  {
    id: 24,
    slug: "india-manufacturing-moment-made-for-the-world",
    product: "Strategy Room",
    title:
      "India's Manufacturing Moment: Can 'Make in India' Become 'Made for the World'?",
    subtitle:
      "Supply chains are diversifying — but incentives alone will not deliver manufacturing leadership",
    excerpt:
      "India is steadily positioning itself as a global manufacturing hub. With supply chains diversifying beyond China, multinational companies are expanding operations across electronics, semiconductors, renewable energy, pharmaceuticals, and defense manufacturing.",
    author: "Finbytes Strategy Room",
    authorTitle: "Strategy Desk",
    date: "August 2, 2026",
    readTime: "4 min read",
    image: "/images/india-semiconductor-mission.jpeg",
    body: [
      "India is steadily positioning itself as a global manufacturing hub. With supply chains diversifying beyond China, multinational companies are expanding operations across electronics, semiconductors, renewable energy, pharmaceuticals, and defense manufacturing. Government initiatives such as the Production Linked Incentive (PLI) scheme, infrastructure expansion, and digital governance have strengthened India's investment appeal.",
      "Yet manufacturing leadership requires more than incentives. India must improve logistics efficiency, workforce skills, research and development, and ease of doing business. Building globally competitive supply chains and supporting MSMEs will be equally critical.",
      "The coming decade offers India a rare opportunity to become a trusted manufacturing partner for the world. Success will depend on execution, innovation, and policy consistency.",
      {
        type: "pullquote" as const,
        text: "Strategy Insight: India's competitive advantage will be decided less by incentives than by execution — logistics, skills and policy consistency are what turn opportunity into national growth.",
      },
    ],
  },
];
export const byId = (id: string) => {
  return ARTICLES.find((article) => article.id === Number(id));
};
// ============================================
// LATEST VIDEOS
// ============================================

export const LATEST_VIDEOS: Video[] = [
  {
    id: "v1",
    videoId: "dQw4w9WgXcQ",
    title: "The Fed Decision Decoded: What a Rate Pause Means for Your Portfolio in 2026",
    duration: "18:42",
    date: "June 8, 2026",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop&auto=format",
  },
  {
    id: "v2",
    videoId: "dQw4w9WgXcQ",
    title: "AI Infrastructure Wars: Inside the $150B Data Center Race",
    duration: "24:17",
    date: "June 6, 2026",
    thumbnail: "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=800&h=450&fit=crop&auto=format",
  },
  {
    id: "v3",
    videoId: "dQw4w9WgXcQ",
    title: "ASEAN's Silent Revolution: How Southeast Asia Is Winning the Industrial Policy Game",
    duration: "31:05",
    date: "June 4, 2026",
    thumbnail: "https://images.unsplash.com/photo-1647510283846-ed174cc84a78?w=800&h=450&fit=crop&auto=format",
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getArticlesByProduct(product: Product): Article[] {
  return ARTICLES.filter((article) => article.product === product);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function getArticleById(id: number): Article | undefined {
  return ARTICLES.find((article) => article.id === id);
}

export function getRelatedArticles(
  productName: Product,
  currentSlug: string,
  limit: number = 3
): Article[] {
  return ARTICLES.filter(
    (article) => article.product === productName && article.slug !== currentSlug
  ).slice(0, limit);
}

// ============================================
// WEEK 4 — SEARCH & FILTER
// ============================================

export type SortOption = "relevance" | "newest";

export interface SearchFilters {
  q?: string;
  product?: Product | "";
  author?: string;
  dateFrom?: string; // ISO yyyy-mm-dd
  dateTo?: string; // ISO yyyy-mm-dd
  sort?: SortOption;
}

// Distinct author list for the sidebar dropdown, alphabetically sorted.
export function getAllAuthors(): string[] {
  return Array.from(new Set(ARTICLES.map((a) => a.author))).sort((x, y) =>
    x.localeCompare(y)
  );
}

// Flatten the body (strings + pullquotes) into one searchable string.
function bodyToText(body: Article["body"]): string {
  return body
    .map((block) => (typeof block === "string" ? block : block.text))
    .join(" ");
}

// Weighted relevance score for a single article against a lowercased query.
function relevanceScore(article: Article, q: string): number {
  if (!q) return 0;
  let score = 0;
  const inc = (haystack: string | undefined, weight: number) => {
    if (haystack && haystack.toLowerCase().includes(q)) score += weight;
  };
  inc(article.title, 5);
  inc(article.subtitle, 3);
  inc(article.excerpt, 3);
  inc(article.author, 3);
  inc(article.product, 2);
  inc(bodyToText(article.body), 1);
  return score;
}

// Main search: text relevance + category/author/date filters + sort.
export function searchArticles(filters: SearchFilters): Article[] {
  const q = (filters.q ?? "").trim().toLowerCase();
  const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const to = filters.dateTo ? new Date(filters.dateTo) : null;
  // Include the whole "to" day.
  if (to) to.setHours(23, 59, 59, 999);

  let items = ARTICLES.filter((article) => {
    if (filters.product && article.product !== filters.product) return false;
    if (filters.author && article.author !== filters.author) return false;

    if (from || to) {
      const d = new Date(article.date);
      if (!isNaN(d.getTime())) {
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
    }

    if (q && relevanceScore(article, q) === 0) return false;
    return true;
  });

  const sort: SortOption = filters.sort ?? (q ? "relevance" : "newest");
  if (sort === "relevance" && q) {
    items = items
      .map((a) => ({ a, s: relevanceScore(a, q) }))
      .sort((x, y) => y.s - x.s)
      .map((x) => x.a);
  } else {
    // Newest first by parsed date; fall back to id order.
    items = [...items].sort((x, y) => {
      const dx = new Date(x.date).getTime() || 0;
      const dy = new Date(y.date).getTime() || 0;
      return dy - dx;
    });
  }

  return items;
}
