export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-3)
  category: 'Hardware' | 'Software' | 'General' | 'Logic' | 'History' | 'Networking' | 'Data'; 
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: "Which component is often referred to as the 'Brain' of the computer?",
    options: ["GPU", "RAM", "CPU", "PSU"],
    correctAnswer: 2,
    category: "Hardware"
  },
  {
    id: 2,
    question: "What does HTML stand for in web development?",
    options: ["HyperText Markup Language", "HighTech Modern Language", "HyperLink Main Line", "Home Tool Markup Language"],
    correctAnswer: 0,
    category: "Software"
  },
  {
    id: 3,
    question: "In Boolean logic, what is the result of (TRUE AND FALSE) OR TRUE?",
    options: ["FALSE", "TRUE", "NULL", "UNDEFINED"],
    correctAnswer: 1,
    category: "Logic"
  },
  {
    id: 4,
    question: "Who is widely considered to be the first computer programmer?",
    options: ["Alan Turing", "Ada Lovelace", "Charles Babbage", "Grace Hopper"],
    correctAnswer: 1,
    category: "History"
  },
  {
    id: 5,
    question: "Which port is universally used for unencrypted HTTP traffic?",
    options: ["Port 21", "Port 443", "Port 80", "Port 22"],
    correctAnswer: 2,
    category: "Networking"
  },
  {
    id: 6,
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Creative Style System", "Cascading Style Sheets", "Colorful Syntax Styles"],
    correctAnswer: 2,
    category: "Software"
  },
  {
    id: 7,
    question: "The binary number system operates on which base?",
    options: ["Base 10", "Base 2", "Base 8", "Base 16"],
    correctAnswer: 1,
    category: "Logic"
  },
  {
    id: 8,
    question: "How many bits make up a single Byte?",
    options: ["4", "8", "16", "32"],
    correctAnswer: 1,
    category: "Data"
  },
  {
    id: 9,
    question: "Which of these is considered 'volatile' memory, losing its data when power is lost?",
    options: ["RAM", "ROM", "SSD", "HDD"],
    correctAnswer: 0,
    category: "Hardware"
  },
  {
    id: 10,
    question: "Who is the original creator of the Git version control system?",
    options: ["Bill Gates", "Steve Jobs", "Linus Torvalds", "Mark Zuckerberg"],
    correctAnswer: 2,
    category: "Software"
  },
  {
    id: 11,
    question: "What does SSD stand for in computer storage?",
    options: ["Super Speed Drive", "Solid State Drive", "System Storage Disk", "Secure Sector Drive"],
    correctAnswer: 1,
    category: "Hardware"
  },
  {
    id: 12,
    question: "In database management, what does SQL stand for?",
    options: ["Structured Query Language", "System Question Logic", "Standard Query Line", "Sequential Query Language"],
    correctAnswer: 0,
    category: "Software"
  },
  {
    id: 13,
    question: "In Boolean logic, an XOR (Exclusive OR) gate returns TRUE only when:",
    options: ["Both inputs are TRUE", "Both inputs are FALSE", "Exactly one input is TRUE", "At least one input is TRUE"],
    correctAnswer: 2,
    category: "Logic"
  },
  {
    id: 14,
    question: "What is the primary function of a DNS server?",
    options: ["Encrypting data", "Hosting websites", "Translating domain names to IP addresses", "Blocking malware"],
    correctAnswer: 2,
    category: "Networking"
  },
  {
    id: 15,
    question: "What material was the very first computer mouse made of?",
    options: ["Plastic", "Aluminum", "Wood", "Glass"],
    correctAnswer: 2,
    category: "History"
  },
  {
    id: 16,
    question: "The hexadecimal system uses numbers 0-9 and which letters?",
    options: ["A-F", "A-Z", "X-Z", "A-E"],
    correctAnswer: 0,
    category: "Data"
  },
  {
    id: 17,
    question: "Which major tech company originally created the React framework?",
    options: ["Google", "Microsoft", "Amazon", "Facebook (Meta)"],
    correctAnswer: 3,
    category: "Software"
  },
  {
    id: 18,
    question: "What does GPU stand for?",
    options: ["General Processing Unit", "Graphics Processing Unit", "Gaming Performance Unit", "Graphical Pixel Utility"],
    correctAnswer: 1,
    category: "Hardware"
  },
  {
    id: 19,
    question: "What is the standard loopback IP address (localhost)?",
    options: ["192.168.0.1", "255.255.255.0", "127.0.0.1", "10.0.0.1"],
    correctAnswer: 2,
    category: "Networking"
  },
  {
    id: 20,
    question: "What does JSON stand for?",
    options: ["JavaScript Object Notation", "Java Standard Output Network", "JavaScript Oriented Nodes", "Java Syntax Object Name"],
    correctAnswer: 0,
    category: "Data"
  },
  {
    id: 21,
    question: "The Python programming language was named after:",
    options: ["A species of snake", "A British comedy troupe", "A constellation", "The creator's pet"],
    correctAnswer: 1,
    category: "History"
  },
  {
    id: 22,
    question: "Which component acts as the main circuit board connecting all other computer parts?",
    options: ["The CPU", "The Chassis", "The Power Supply", "The Motherboard"],
    correctAnswer: 3,
    category: "Hardware"
  },
  {
    id: 23,
    question: "According to De Morgan's Laws in logic, NOT (A AND B) is equivalent to:",
    options: ["NOT A AND NOT B", "NOT A OR NOT B", "A OR B", "A AND B"],
    correctAnswer: 1,
    category: "Logic"
  },
  {
    id: 24,
    question: "When a server returns a '404' HTTP status code, what does it mean?",
    options: ["Internal Server Error", "Unauthorized", "Not Found", "Bad Request"],
    correctAnswer: 2,
    category: "Networking"
  },
  {
    id: 25,
    question: "What is the mascot of the Linux operating system?",
    options: ["A dog", "A penguin", "A red hat", "A dolphin"],
    correctAnswer: 1,
    category: "History"
  },
  {
    id: 26,
    question: "What does BIOS stand for?",
    options: ["Basic Input/Output System", "Binary Integrated Operating System", "Base Internal Output Source", "Board Integrated Outbound System"],
    correctAnswer: 0,
    category: "Hardware"
  },
  {
    id: 27,
    question: "What does API stand for?",
    options: ["Automated Programming Interface", "Application Programming Interface", "Advanced Performance Index", "Application Process Integration"],
    correctAnswer: 1,
    category: "Software"
  },
  {
    id: 28,
    question: "Which of the following is an example of a NoSQL database?",
    options: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
    correctAnswer: 2,
    category: "Data"
  },
  {
    id: 29,
    question: "If a network operates on a /24 subnet mask, how many bits are used for the network portion?",
    options: ["8", "16", "24", "32"],
    correctAnswer: 2,
    category: "Networking"
  },
  {
    id: 30,
    question: "In object-oriented programming, what principle hides the internal state of an object?",
    options: ["Inheritance", "Polymorphism", "Abstraction", "Encapsulation"],
    correctAnswer: 3,
    category: "Software"
  }
];