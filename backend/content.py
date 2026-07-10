
import math

STUDENT_SEED_ORDER = [
    "stu01", "stu02", "stu03", "stu04", "stu05", "stu06", "stu07", "stu08",
    "stu09", "stu10", "stu11", "stu12", "stu13", "stu14", "stu15", "stu16",
    "stu17", "stu18", "stu19", "stu20",
]

AVATAR_PALETTE = ["#2F6F8F", "#946B3D", "#5C5470", "#2F6F5B", "#6B4E9E", "#C1432A"]


def initials_of(name: str) -> str:
    parts = name.split(" ")
    return "".join(p[0] for p in parts if p)[:2].upper()


def avatar_color(idx: int) -> str:
    return AVATAR_PALETTE[idx % len(AVATAR_PALETTE)]


def seeded(seed: int, lo: int, hi: int) -> int:
    """Deterministic pseudo-random int in [lo, hi] — same seed, same
    result, every time, with no stored state at all."""
    x = math.sin(seed * 9301 + 49297) * 233280
    r = x - math.floor(x)
    return round(lo + r * (hi - lo))


#Curriculum: subjects / chapters / micro-concepts
SUBJECTS = [
    {
        "id": "phy", "name": "Physics", "color": "#2F6F8F",
        "chapters": [
            {"id": "rot-mech", "name": "Rotational Mechanics", "status": "active", "accuracy": 78, "progress": 92, "cppDone": 6, "cppTotal": 8,
             "microConcepts": [{"name": "Torque & Equilibrium", "accuracy": 82}, {"name": "Angular Momentum", "accuracy": 75}, {"name": "Rolling Motion", "accuracy": 71}, {"name": "Moment of Inertia", "accuracy": 80}]},
            {"id": "electrostat", "name": "Electrostatics", "status": "active", "accuracy": 64, "progress": 70, "cppDone": 5, "cppTotal": 8,
             "microConcepts": [{"name": "Coulomb's Law", "accuracy": 70}, {"name": "Gauss's Law", "accuracy": 58}, {"name": "Electric Potential", "accuracy": 66}, {"name": "Capacitors", "accuracy": 60}]},
            {"id": "curr-elec", "name": "Current Electricity", "status": "active", "accuracy": 71, "progress": 55, "cppDone": 4, "cppTotal": 7,
             "microConcepts": [{"name": "Kirchhoff's Laws", "accuracy": 74}, {"name": "Resistivity & Combinations", "accuracy": 69}, {"name": "RC Circuits", "accuracy": 65}]},
            {"id": "thermo", "name": "Thermodynamics", "status": "expired", "accuracy": 82, "progress": 100, "cppDone": 6, "cppTotal": 6,
             "microConcepts": [{"name": "Laws of Thermodynamics", "accuracy": 85}, {"name": "Heat Engines", "accuracy": 78}, {"name": "Entropy", "accuracy": 80}]},
            {"id": "wave-opt", "name": "Wave Optics", "status": "upcoming", "accuracy": 0, "progress": 0, "cppDone": 0, "cppTotal": 6},
            {"id": "modern-phy", "name": "Modern Physics", "status": "upcoming", "accuracy": 0, "progress": 0, "cppDone": 0, "cppTotal": 7},
        ],
    },
    {
        "id": "chem", "name": "Chemistry", "color": "#946B3D",
        "chapters": [
            {"id": "ionic-eq", "name": "Ionic Equilibrium", "status": "active", "accuracy": 58, "progress": 60, "cppDone": 4, "cppTotal": 9,
             "microConcepts": [{"name": "Buffers", "accuracy": 55}, {"name": "Common Ion Effect", "accuracy": 60}, {"name": "Hydrolysis of Salts", "accuracy": 58}]},
            {"id": "chem-bond", "name": "Chemical Bonding", "status": "expired", "accuracy": 75, "progress": 100, "cppDone": 7, "cppTotal": 7,
             "microConcepts": [{"name": "VSEPR Theory", "accuracy": 78}, {"name": "Hybridisation", "accuracy": 73}, {"name": "MOT Basics", "accuracy": 74}]},
            {"id": "p-block", "name": "p-Block Elements", "status": "active", "accuracy": 69, "progress": 45, "cppDone": 3, "cppTotal": 8,
             "microConcepts": [{"name": "Group 13 Trends", "accuracy": 72}, {"name": "Group 15 Anomalies", "accuracy": 64}, {"name": "Group 17 Trends", "accuracy": 70}]},
            {"id": "electrochem", "name": "Electrochemistry", "status": "active", "accuracy": 60, "progress": 30, "cppDone": 2, "cppTotal": 7,
             "microConcepts": [{"name": "Nernst Equation", "accuracy": 58}, {"name": "Electrolysis", "accuracy": 62}, {"name": "Conductance", "accuracy": 59}]},
            {"id": "ald-ket", "name": "Aldehydes & Ketones", "status": "upcoming", "accuracy": 0, "progress": 0, "cppDone": 0, "cppTotal": 8},
        ],
    },
    {
        "id": "math", "name": "Mathematics", "color": "#5C5470",
        "chapters": [
            {"id": "def-int", "name": "Definite Integration", "status": "active", "accuracy": 66, "progress": 80, "cppDone": 6, "cppTotal": 8,
             "microConcepts": [{"name": "Properties of Integrals", "accuracy": 70}, {"name": "Reduction Formulae", "accuracy": 60}, {"name": "Integral as Limit of Sum", "accuracy": 65}]},
            {"id": "prob", "name": "Probability", "status": "active", "accuracy": 73, "progress": 65, "cppDone": 5, "cppTotal": 7,
             "microConcepts": [{"name": "Conditional Probability", "accuracy": 76}, {"name": "Bayes' Theorem", "accuracy": 68}, {"name": "Binomial Distribution", "accuracy": 74}]},
            {"id": "vec-3d", "name": "Vectors & 3-D Geometry", "status": "expired", "accuracy": 80, "progress": 100, "cppDone": 8, "cppTotal": 8,
             "microConcepts": [{"name": "Scalar & Vector Triple Product", "accuracy": 82}, {"name": "Shortest Distance Between Lines", "accuracy": 77}, {"name": "Direction Cosines", "accuracy": 81}]},
            {"id": "complex-no", "name": "Complex Numbers", "status": "active", "accuracy": 54, "progress": 35, "cppDone": 2, "cppTotal": 6,
             "microConcepts": [{"name": "Argument & Modulus", "accuracy": 58}, {"name": "De Moivre's Theorem", "accuracy": 50}, {"name": "Locus Problems", "accuracy": 55}]},
            {"id": "matrices", "name": "Matrices & Determinants", "status": "upcoming", "accuracy": 0, "progress": 0, "cppDone": 0, "cppTotal": 6},
        ],
    },
]

ALL_CHAPTERS = {ch["id"]: {**ch, "subject": s["name"], "subjectColor": s["color"]}
                for s in SUBJECTS for ch in s["chapters"]}

#Lectures / Tests / Workbooks

LECTURES = [
    {"id": "m1", "youtube_url": "https://www.youtube.com/watch?v=nf6EA9sLiwk", "subject": "Mathematics", "chapter": "Coordinate Geometry", "title": "Circle", "faculty": "Arvind Kalia", "duration": "4:40:50", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m2", "youtube_url": "https://www.youtube.com/watch?v=uVEOu40lYEY", "subject": "Mathematics", "chapter": "Calculus", "title": "Application of Derivatives", "faculty": "Physics Wallah", "duration": "2:25:26", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m3", "youtube_url": "https://www.youtube.com/watch?v=dKecT2jZkxI", "subject": "Mathematics", "chapter": "Calculus", "title": "Integration", "faculty": "Arvind Kalia", "duration": "4:24:40", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m4", "youtube_url": "https://www.youtube.com/watch?v=YrwNkbHnkC8", "subject": "Mathematics", "chapter": "Algebra", "title": "Binomial Theorem", "faculty": "Arvind Kalia", "duration": "4:01:27", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m5", "youtube_url": "https://www.youtube.com/watch?v=pzzoBw3cm1Q", "subject": "Mathematics", "chapter": "Trigonometry", "title": "Trigonometry", "faculty": "Arvind Kalia", "duration": "5:07:31", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m6", "youtube_url": "https://www.youtube.com/watch?v=4nUwzrpZeY0", "subject": "Mathematics", "chapter": "3D Geometry", "title": "Vectors", "faculty": "Arvind Kalia", "duration": "5:50:34", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m7", "youtube_url": "https://www.youtube.com/watch?v=H4xJgkg-fkA", "subject": "Chemistry", "chapter": "Physical Chemistry", "title": "Gaseous State", "faculty": "Mohit Ryan", "duration": "4:19:23", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m8", "youtube_url": "https://www.youtube.com/watch?v=a81B2EupaJM", "subject": "Chemistry", "chapter": "Physical Chemistry", "title": "Solid State", "faculty": "Mohit Ryan", "duration": "4:10:37", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m9", "youtube_url": "https://www.youtube.com/watch?v=BO7uTxXqYtM", "subject": "Chemistry", "chapter": "Physical Chemistry", "title": "Chemical Kinetics", "faculty": "Mohit Ryan", "duration": "4:16:02", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m10", "youtube_url": "https://www.youtube.com/watch?v=6xbxdeqd41I", "subject": "Chemistry", "chapter": "Inorganic Chemistry", "title": "Chemical Bonding", "faculty": "Mohit Ryan", "duration": "5:38:24", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m11", "youtube_url": "https://www.youtube.com/watch?v=XIIzNv2wGmI", "subject": "Chemistry", "chapter": "Inorganic Chemistry", "title": "S-Block Elements & Hydrogen", "faculty": "Mohit Ryan", "duration": "2:56:56", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m12", "youtube_url": "https://www.youtube.com/watch?v=vgbbNBZbjl8", "subject": "Chemistry", "chapter": "Inorganic Chemistry", "title": "D & F-Block Elements", "faculty": "Mohit Ryan", "duration": "3:13:44", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m13", "youtube_url": "https://www.youtube.com/watch?v=yQSo2phwyzg", "subject": "Chemistry", "chapter": "Organic Chemistry", "title": "Generic Organic Chemistrry and Isomerism", "faculty": "Mohit Ryan", "duration": "3:44:23", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m14", "youtube_url": "https://www.youtube.com/watch?v=hqN086EQyTw", "subject": "Chemistry", "chapter": "Organic Chemistry", "title": "Alcohol,Ether & Phenols", "faculty": "Mohit Ryan", "duration": "3:11:12", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m15", "youtube_url": "https://www.youtube.com/watch?v=2P9MMXVKAv0", "subject": "Chemistry", "chapter": "Organic Chemistry", "title": "Carboxylic Acids & Derivatives", "faculty": "Mohit Ryan", "duration": "4:22:38", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m16", "youtube_url": "https://www.youtube.com/watch?v=-jv5x51RXGM", "subject": "Physics", "chapter": "Mechanics", "title": "Kinematics", "faculty": "Jayant Sir", "duration": "4:16:49", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m17", "youtube_url": "https://www.youtube.com/watch?v=bXWyJfxdqzc", "subject": "Physics", "chapter": "Mechanics", "title": "Work,Power & Energy", "faculty": "Vinay Shur", "duration": "1:38:55", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m18", "youtube_url": "https://www.youtube.com/watch?v=MIZpT0FwLME", "subject": "Physics", "chapter": "Mechanics", "title": "Rotational Mechanics", "faculty": "Vinay Shur", "duration": "2:02:44", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m19", "youtube_url": "https://www.youtube.com/watch?v=KcM-79DVfAc", "subject": "Physics", "chapter": "Wave Optics", "title": "Simple Harmonic Motion", "faculty": "Himanshu Gupta", "duration": "5:19:40", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m20", "youtube_url": "https://www.youtube.com/watch?v=UufMX5vUEuU", "subject": "Physics", "chapter": "Electric Phenomena", "title": "Current Electricity", "faculty": "Physics Wallah", "duration": "2:15:14", "watched": 0, "recordedOn": "20 Jun 2026"},
    {"id": "m21", "youtube_url": "https://www.youtube.com/watch?v=iWpZzr4Cbo0", "subject": "Physics", "chapter": "Magnetic Phenomena", "title": "Electromagnetic Induction", "faculty": "Physics Wallah", "duration": "2:03:13", "watched": 0, "recordedOn": "20 Jun 2026"},
    ]

WORKBOOKS = [
    {"id": "w1", "subject": "Physics", "chapter": "Rotational Mechanics", "title": "Workbook 4 — Torque & Equilibrium", "questions": 32, "pages": 14, "unlockedAfter": "Lecture 58 of 2026-06-12"},
    {"id": "w2", "subject": "Physics", "chapter": "Electrostatics", "title": "Workbook 3 — Gauss's Law Applications", "questions": 28, "pages": 12, "unlockedAfter": "Lecture 55 of 2026-06-09"},
    {"id": "w3", "subject": "Chemistry", "chapter": "Ionic Equilibrium", "title": "Workbook 5 — Buffers & Hydrolysis", "questions": 36, "pages": 16, "unlockedAfter": "Lecture 41 of 2026-06-10"},
    {"id": "w4", "subject": "Mathematics", "chapter": "Definite Integration", "title": "Workbook 6 — Properties & Reduction Formulae", "questions": 30, "pages": 13, "unlockedAfter": "Lecture 49 of 2026-06-08"},
]

#  CPP bank: subjective worksheets + objective auto-graded quiz 
CPP_BANK = {
    "rot-mech": {
        "subjective": [
            {"id": "s1", "marks": 4, "text": "A uniform rod of mass m and length L is pivoted at one end and released from rest in a horizontal position. Find the angular speed of the rod as it passes through the vertical position."},
            {"id": "s2", "marks": 4, "text": "A spool of thread rests on a rough horizontal table. The thread is pulled at an angle θ to the horizontal. Find the range of θ for which the spool rolls towards the puller."},
            {"id": "s3", "marks": 6, "text": "A disc and a ring of the same mass and radius start from rest and roll down identical inclines without slipping. Derive the ratio of the times they take to reach the bottom."},
            {"id": "s4", "marks": 4, "text": "Two point masses m and 2m are connected by a light rigid rod of length L. Find the moment of inertia of the system about an axis perpendicular to the rod through its centre of mass."},
        ],
        "objective": [
            {"id": "q1", "text": "A uniform disc of mass M and radius R rolls without slipping on a horizontal surface. The ratio of its rotational kinetic energy to its total kinetic energy is:", "options": ["1/3", "1/2", "2/3", "1/4"], "answer": 0, "solution": "For a disc, I = ½MR². Rolling without slipping gives v = ωR. KE_rot/KE_total works out to 1/3 after substitution."},
            {"id": "q2", "text": "A solid sphere and a hollow sphere of the same mass and radius are released from the same height on a frictionless incline. Which reaches the bottom first?", "options": ["Solid sphere", "Hollow sphere", "Both together", "Cannot be determined"], "answer": 2, "solution": "On a frictionless incline there is no rolling — both slide as point masses, so they reach the bottom together regardless of moment of inertia."},
            {"id": "q3", "text": "The angular momentum of a system of particles is conserved when:", "options": ["Net force is zero", "Net torque about the axis is zero", "Linear momentum is zero", "Kinetic energy is constant"], "answer": 1, "solution": "Angular momentum L is conserved whenever the net external torque about the chosen axis is zero — the rotational analogue of Newton's first law."},
            {"id": "q4", "text": "A flywheel of moment of inertia 4 kg·m² is rotating at 60 rad/s. The torque required to bring it to rest in 4 s is:", "options": ["60 N·m", "30 N·m", "15 N·m", "120 N·m"], "answer": 0, "solution": "α = Δω/Δt = 60/4 = 15 rad/s². Torque τ = Iα = 4 × 15 = 60 N·m."},
        ],
    },
    "electrostat": {
        "subjective": [
            {"id": "s1", "marks": 4, "text": "State Gauss's law and use it to find the electric field at a point outside a uniformly charged solid sphere of radius R and total charge Q."},
            {"id": "s2", "marks": 6, "text": "Three point charges +q, +q and −q are placed at the vertices of an equilateral triangle of side a. Find the net electrostatic potential energy of the system."},
        ],
        "objective": [
            {"id": "q1", "text": "Two capacitors of 4 μF and 6 μF are connected in series across a 100 V supply. The charge on each capacitor is:", "options": ["240 μC", "400 μC", "600 μC", "1000 μC"], "answer": 0, "solution": "Series capacitance Ceq = (4×6)/(4+6) = 2.4 μF. Charge = Ceq × V = 2.4 × 100 = 240 μC, same on both in series."},
            {"id": "q2", "text": "The electric field inside a uniformly charged hollow conducting sphere is:", "options": ["Maximum at the centre", "Zero everywhere inside", "Equal to the field just outside", "Directed radially inward"], "answer": 1, "solution": "Charge on a conductor resides on the outer surface; by Gauss's law the enclosed charge for any interior surface is zero, so E = 0 throughout the cavity."},
        ],
    },
    "ionic-eq": {
        "subjective": [
            {"id": "s1", "marks": 4, "text": "Derive the Henderson–Hasselbalch equation for an acidic buffer starting from the equilibrium expression for a weak acid."},
            {"id": "s2", "marks": 4, "text": "Calculate the pH of a buffer prepared by mixing 0.2 mol of CH₃COOH and 0.3 mol of CH₃COONa in 1 L of solution. (Ka of CH₃COOH = 1.8 × 10⁻⁵)"},
            {"id": "s3", "marks": 5, "text": "Explain, with the help of the common-ion effect, why the solubility of AgCl decreases on adding NaCl solution to it."},
        ],
        "objective": [
            {"id": "q1", "text": "Which of the following is the strongest Lewis acid?", "options": ["BF₃", "BCl₃", "BBr₃", "BI₃"], "answer": 3, "solution": "Back-bonding from halogen to boron's empty p-orbital is weakest for I (largest, most diffuse orbital), so BI₃ has the least electron density on B and is the strongest Lewis acid."},
            {"id": "q2", "text": "The pH of a 0.01 M solution of a weak acid (Ka = 1 × 10⁻⁶) is closest to:", "options": ["2", "4", "6", "8"], "answer": 1, "solution": "[H+] ≈ √(Ka·C) = √(1×10⁻⁶ × 0.01) = √(1×10⁻⁸) = 1×10⁻⁴. pH = 4."},
            {"id": "q3", "text": "In the Henderson–Hasselbalch equation, pH equals pKa when:", "options": ["[Salt] = [Acid]", "[Salt] > [Acid]", "[Salt] < [Acid]", "[Acid] = 0"], "answer": 0, "solution": "pH = pKa + log([Salt]/[Acid]). The log term vanishes, giving pH = pKa, exactly when [Salt] = [Acid]."},
        ],
    },
    "p-block": {
        "subjective": [
            {"id": "s1", "marks": 4, "text": "Account for the anomalous behaviour of nitrogen compared to the other members of group 15."},
            {"id": "s2", "marks": 4, "text": "Explain why BF₃ acts as a Lewis acid while NF₃ does not, despite both having a lone pair on the central atom in the parent comparison."},
        ],
        "objective": [
            {"id": "q1", "text": "Which of the following oxides of nitrogen is a neutral oxide?", "options": ["N₂O", "NO", "N₂O₃", "N₂O₅"], "answer": 0, "solution": "N₂O (nitrous oxide) does not react with water or react as an acidic/basic oxide under normal conditions, so it is classed as neutral; NO is also often classed neutral, but N₂O is the standard textbook example expected here."},
        ],
    },
    "def-int": {
        "subjective": [
            {"id": "s1", "marks": 4, "text": "Using the property ∫₀^a f(x)dx = ∫₀^a f(a−x)dx, evaluate ∫₀^(π/2) (sin x)/(sin x + cos x) dx."},
            {"id": "s2", "marks": 5, "text": "Evaluate ∫₀^1 x(1−x)⁹ dx using the Beta function or reduction technique."},
        ],
        "objective": [
            {"id": "q1", "text": "The value of ∫₀^(π/2) sin³x cos²x dx is:", "options": ["2/15", "4/15", "1/15", "8/15"], "answer": 0, "solution": "Using the standard reduction result for ∫sin^m x cos^n x dx over [0, π/2] with m=3 (odd), the integral evaluates to 2/15."},
            {"id": "q2", "text": "∫₋ₐ^a f(x) dx = 2∫₀^a f(x) dx is valid when f(x) is:", "options": ["Odd", "Even", "Periodic", "Monotonic"], "answer": 1, "solution": "This doubling property holds specifically for even functions, where f(−x) = f(x); for odd functions the integral over a symmetric interval is zero instead."},
        ],
    },
    "prob": {
        "subjective": [
            {"id": "s1", "marks": 4, "text": "A bag contains 5 red and 7 black balls. Two balls are drawn without replacement. Find the probability that both are of the same colour."},
        ],
        "objective": [
            {"id": "q1", "text": "If A and B are independent events with P(A) = 0.4 and P(B) = 0.5, then P(A ∪ B) equals:", "options": ["0.7", "0.9", "0.2", "0.6"], "answer": 0, "solution": "P(A∪B) = P(A) + P(B) − P(A)P(B) for independent events = 0.4 + 0.5 − 0.2 = 0.7."},
            {"id": "q2", "text": "The number of complex numbers z satisfying |z| = 1 and z² = z̄ is:", "options": ["2", "3", "4", "Infinite"], "answer": 1, "solution": "Writing z = e^(iθ), the condition z² = z̄ becomes e^(3iθ) = 1, giving 3 distinct solutions for θ in [0, 2π)."},
        ],
    },
    # expired chapters — archived: still readable, no new attempts scored
    "thermo": {
        "archived": True,
        "subjective": [
            {"id": "s1", "marks": 4, "text": "State the first law of thermodynamics and apply it to an isothermal expansion of an ideal gas."},
        ],
        "objective": [
            {"id": "q1", "text": "For an adiabatic process undergone by an ideal gas:", "options": ["PV = constant", "TV^(γ−1) = constant", "Q = 0", "ΔU = Q"], "answer": 2, "solution": "By definition, an adiabatic process has no heat exchange with the surroundings, so Q = 0. (TVγ⁻¹ = constant is also true but follows from Q = 0, not the defining condition.)"},
        ],
    },
    "chem-bond": {
        "archived": True,
        "subjective": [
            {"id": "s1", "marks": 4, "text": "Using VSEPR theory, predict and justify the shape of XeF₄."},
        ],
        "objective": [
            {"id": "q1", "text": "The hybridisation of the central atom in SF₆ is:", "options": ["sp³", "sp³d", "sp³d²", "sp³d³"], "answer": 2, "solution": "SF₆ has 6 bond pairs and no lone pairs on sulfur, requiring 6 hybrid orbitals — sp³d² — giving an octahedral geometry."},
        ],
    },
    "vec-3d": {
        "archived": True,
        "subjective": [
            {"id": "s1", "marks": 4, "text": "Find the shortest distance between the lines (x−1)/2 = (y+1)/3 = z/1 and (x−2)/1 = (y−3)/2 = (z+1)/3."},
        ],
        "objective": [
            {"id": "q1", "text": "The angle between the vectors a = î + ĵ and b = ĵ + k̂ is:", "options": ["30°", "45°", "60°", "90°"], "answer": 2, "solution": "cosθ = (a·b)/(|a||b|) = 1/(√2·√2) = 1/2, so θ = 60°."},
        ],
    },
    "curr-elec": {
        "subjective": [
            {"id": "s1", "marks": 4, "text": "Using Kirchhoff's voltage law, find the current through each branch of a circuit with two cells of EMF 6 V and 9 V (internal resistance 1 Ω each) connected in parallel, driving a 4 Ω external resistor."},
            {"id": "s2", "marks": 4, "text": "A wire of resistance R is stretched uniformly until its length doubles. Find the new resistance in terms of R, assuming volume remains constant."},
        ],
        "objective": [
            {"id": "q1", "text": "In a Wheatstone bridge, the bridge is balanced when:", "options": ["All four resistances are equal", "The galvanometer current is zero", "The cell EMF equals zero", "The current is maximum through the galvanometer"], "answer": 1, "solution": "A Wheatstone bridge is balanced precisely when no current flows through the galvanometer arm — that is the defining condition, regardless of the individual resistance values."},
            {"id": "q2", "text": "Two resistors of 6 Ω and 3 Ω are connected in parallel. The equivalent resistance is:", "options": ["9 Ω", "2 Ω", "4.5 Ω", "18 Ω"], "answer": 1, "solution": "1/Req = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2, so Req = 2 Ω."},
        ],
    },
    "electrochem": {
        "subjective": [
            {"id": "s1", "marks": 5, "text": "Using the Nernst equation, calculate the EMF of the cell Zn | Zn²⁺ (0.1 M) || Cu²⁺ (1.0 M) | Cu at 298 K, given E°cell = 1.10 V."},
        ],
        "objective": [
            {"id": "q1", "text": "During the electrolysis of molten NaCl, the product formed at the cathode is:", "options": ["Cl₂ gas", "Na metal", "NaOH", "H₂ gas"], "answer": 1, "solution": "At the cathode of molten NaCl electrolysis, Na⁺ ions are reduced to Na metal; Cl₂ forms at the anode from oxidation of Cl⁻."},
            {"id": "q2", "text": "The standard reduction potential is most positive for which of these, making it the strongest oxidising agent?", "options": ["F₂", "Cl₂", "Br₂", "I₂"], "answer": 0, "solution": "F₂ has the highest standard reduction potential among the halogens, making it the strongest oxidising agent in this group."},
        ],
    },
    "complex-no": {
        "subjective": [
            {"id": "s1", "marks": 4, "text": "If z = x + iy and |z − 3| = |z − 3i|, show that the locus of z is a straight line, and find its equation."},
        ],
        "objective": [
            {"id": "q1", "text": "The modulus of the complex number z = 3 + 4i is:", "options": ["5", "7", "25", "1"], "answer": 0, "solution": "|z| = √(3² + 4²) = √25 = 5."},
            {"id": "q2", "text": "i^4n (where n is a positive integer) is always equal to:", "options": ["i", "−1", "1", "−i"], "answer": 2, "solution": "Since i⁴ = 1, any integer power of i⁴ raised further (i.e. i^(4n)) equals 1ⁿ = 1."},
        ],
    },
}

#Test Engine question bank (NTA pattern: +4 / −1)
ENGINE_QUESTIONS = [
    {"id": 1, "subject": "Physics", "text": "A particle moves in a circle of radius R with constant angular velocity ω. The magnitude of its average velocity over one complete revolution is:", "options": ["ωR", "2ωR", "πωR", "Zero"], "answer": 3},
    {"id": 2, "subject": "Physics", "text": "Two capacitors of 4 μF and 6 μF are connected in series across a 100 V supply. The charge on each capacitor is:", "options": ["240 μC", "400 μC", "600 μC", "1000 μC"], "answer": 0},
    {"id": 3, "subject": "Physics", "text": "The dimensional formula of torque is the same as that of:", "options": ["Force", "Work", "Momentum", "Power"], "answer": 1},
    {"id": 4, "subject": "Chemistry", "text": "Which of the following is the strongest Lewis acid?", "options": ["BF₃", "BCl₃", "BBr₃", "BI₃"], "answer": 3},
    {"id": 5, "subject": "Chemistry", "text": "The pH of a 0.01 M solution of a weak acid (Ka = 1 × 10⁻⁶) is closest to:", "options": ["2", "4", "6", "8"], "answer": 1},
    {"id": 6, "subject": "Chemistry", "text": "In the Henderson–Hasselbalch equation, pH equals pKa when:", "options": ["[Salt] = [Acid]", "[Salt] > [Acid]", "[Salt] < [Acid]", "[Acid] = 0"], "answer": 0},
    {"id": 7, "subject": "Mathematics", "text": "The value of ∫₀^(π/2) sin³x cos²x dx is:", "options": ["2/15", "4/15", "1/15", "8/15"], "answer": 0},
    {"id": 8, "subject": "Mathematics", "text": "If A and B are independent events with P(A) = 0.4 and P(B) = 0.5, then P(A ∪ B) equals:", "options": ["0.7", "0.9", "0.2", "0.6"], "answer": 0},
    {"id": 9, "subject": "Mathematics", "text": "The number of complex numbers z satisfying |z| = 1 and z² = z̄ is:", "options": ["2", "3", "4", "Infinite"], "answer": 1},
    {"id": 10, "subject": "Physics", "text": "A ball is thrown vertically upward. The acceleration during its upward and downward motion is:", "options": ["Upward in both cases", "Downward in both cases", "Upward then downward", "Zero throughout"], "answer": 0},
]

CURRENT_TEST_NAME = "PCM Part Test"
CURRENT_TEST_DURATION_SEC = 90 * 60


#Per-student deterministic performance overlay 
def get_student_stats(student_row_id: str) -> dict:
    try:
        idx = STUDENT_SEED_ORDER.index(student_row_id)
    except ValueError:
        idx = 0
    streak = seeded(idx * 13 + 5, 1, 28)
    chapter_stats = {}
    for subj in SUBJECTS:
        for ch in subj["chapters"]:
            if ch["status"] == "upcoming":
                chapter_stats[ch["id"]] = {"accuracy": 0, "progress": 0, "status": "upcoming"}
                continue
            seed = idx * 97 + sum(ord(c) for c in ch["id"])
            accuracy = max(32, min(97, ch["accuracy"] + seeded(seed, -18, 18)))
            progress = 100 if ch["status"] == "expired" else max(15, min(100, ch["progress"] + seeded(seed + 11, -22, 14)))
            chapter_stats[ch["id"]] = {"accuracy": accuracy, "progress": progress, "status": ch["status"]}
    scored = [c for c in chapter_stats.values() if c["status"] != "upcoming"]
    avg_accuracy = round(sum(c["accuracy"] for c in scored) / len(scored)) if scored else 0
    all_ch = list(chapter_stats.values())
    syllabus_pct = round(sum(c["progress"] for c in all_ch) / len(all_ch)) if all_ch else 0
    return {"streak": streak, "chapterStats": chapter_stats, "avgAccuracy": avg_accuracy, "syllabusPct": syllabus_pct}


def get_weak_chapters(student_row_id: str, count: int = 3) -> list:
    stats = get_student_stats(student_row_id)
    rows = []
    for subj in SUBJECTS:
        for ch in subj["chapters"]:
            if ch["status"] != "active":
                continue
            rows.append({
                "chapter": ch["name"], "subject": subj["name"],
                "accuracy": stats["chapterStats"][ch["id"]]["accuracy"], "chapterId": ch["id"],
            })
    rows.sort(key=lambda r: r["accuracy"])
    return rows[:count]
