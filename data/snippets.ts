export type CodeSnippet = {
  id: number;
  language: 'Python' | 'HTML' | 'CSS' | 'JS' | 'SQL';
  lines: string[];
  correct: number;
};

export const SNIPPET_POOL: CodeSnippet[] = [
  { 
    id: 1, 
    language: 'Python',
    lines: ['def calculate_area(radius):', 'area = 3.14 * radius ** 2', 'return area'], 
    correct: 1 // Indentation error: line 2 must be indented
  },
  { 
    id: 2, 
    language: 'HTML',
    lines: ['<div class="container">', '  <img src="logo.png" alt="Logo">', '  <a src="index.html">Home</a>', '</div>'], 
    correct: 2 // <a> tags use "href", not "src"
  },
  { 
    id: 3, 
    language: 'CSS',
    lines: ['.card {', '  background-color: #fff', '  padding 20px;', '  margin: 10px;', '}'], 
    correct: 2 // Missing colon after "padding"
  },
  { 
    id: 4, 
    language: 'JS',
    lines: ['const users = ["Alice", "Bob"];', 'if (users.length = 0) {', '  console.log("Empty");', '}'], 
    correct: 1 // Using "=" (assignment) instead of "===" (comparison)
  },
  { 
    id: 5, 
    language: 'SQL',
    lines: ['SELECT name, price', 'FROM products', 'WHERE price > 100', 'ORDER price DESC;'], 
    correct: 3 // Missing "BY" in ORDER BY
  },
  { 
    id: 6, 
    language: 'Python',
    lines: ['fruits = ["apple", "banana"]', 'for i in range(len(fruits)):', '  print(fruits[3])'], 
    correct: 2 // Index out of range (max index is 1)
  },
  { 
    id: 7, 
    language: 'HTML',
    lines: ['<ul>', '  <li>Item 1', '  <li>Item 2</li>', '</ul>'], 
    correct: 1 // Missing closing </li> tag
  },
  { 
    id: 8, 
    language: 'CSS',
    lines: ['#header {', '  display: flex;', '  justify-content: center', '  color: blue;', '}'], 
    correct: 2 // Missing semicolon after center
  },
  { 
    id: 9, 
    language: 'JS',
    lines: ['function add(a, b) {', '  console.log(a + b)', '}', 'const res = add(5, 5) * 2;'], 
    correct: 3 // Function returns undefined; cannot multiply by 2
  },
  { 
    id: 10, 
    language: 'SQL',
    lines: ['INSERT INTO logs', '(message, user_id)', 'VALUES', '("Login success");'], 
    correct: 3 // Only 1 value provided for 2 columns
  },
  { 
    id: 11, 
    language: 'Python',
    lines: ['age = input("Enter age: ")', 'if age >= 18:', '  print("Adult")'], 
    correct: 1 // input() returns a string; needs int(age) to compare with 18
  },
  { 
    id: 12, 
    language: 'HTML',
    lines: ['<table>', '  <tr>', '    <td>Cell 1</td>', '  <tr>', '</table>'], 
    correct: 3 // Missing closing </tr> tag
  },
  { 
    id: 13, 
    language: 'CSS',
    lines: ['.box {', '  width: 100;', '  height: 100px;', '}'], 
    correct: 1 // Missing units (e.g., 100px or 100%)
  },
  { 
    id: 14, 
    language: 'JS',
    lines: ['const btn = document.querySelector(".btn");', 'btn.addEventListener("click", () => {', '  alert("Clicked!")', ');'], 
    correct: 3 // Missing closing brace "}" for the arrow function
  },
  { 
    id: 15, 
    language: 'SQL',
    lines: ['SELECT *', 'FROM orders', 'WHERE status is "pending";'], 
    correct: 2 // Should be "WHERE status = 'pending'"
  },
  { 
    id: 16, 
    language: 'Python',
    lines: ['data = {"id": 1, "name": "Test"}', 'print(data.name)'], 
    correct: 1 // Dict values accessed via data["name"], not dot notation
  },
  { 
    id: 17, 
    language: 'HTML',
    lines: ['<form>', '  <label for="name">Name:</label>', '  <input type="text" id="username">', '</form>'], 
    correct: 2 // Label "for" doesn't match Input "id"
  },
  { 
    id: 18, 
    language: 'CSS',
    lines: ['body {', '  background: url(bg.jpg);', '  font-size: 16px', '  line-height: 1.5;', '}'], 
    correct: 2 // Missing semicolon
  },
  { 
    id: 19, 
    language: 'JS',
    lines: ['const items = [1, 2, 3];', 'items.forEach(i => {', '  return i * 2;', '});'], 
    correct: 2 // forEach does not return values (unlike .map)
  },
  { 
    id: 20, 
    language: 'SQL',
    lines: ['SELECT category, SUM(sales)', 'FROM reports', 'HAVING SUM(sales) > 1000;'], 
    correct: 2 // HAVING requires a GROUP BY clause
  },
  { 
    id: 21, 
    language: 'Python',
    lines: ['def say_hello():', 'print("Hello world")'], 
    correct: 1 // Indentation error
  },
  { 
    id: 22, 
    language: 'HTML',
    lines: ['<head>', '  <title>My Page</title>', '  <link src="style.css">', '</head>'], 
    correct: 2 // <link> uses "href", not "src"
  },
  { 
    id: 23, 
    language: 'CSS',
    lines: ['.title {', '  text-align: center;', '  fontweight: bold;', '}'], 
    correct: 2 // Property name is "font-weight" (missing dash)
  },
  { 
    id: 24, 
    language: 'JS',
    lines: ['async function getData() {', '  const res = fetch("/api");', '  return res.json();', '}'], 
    correct: 1 // Missing "await" before fetch()
  },
  { 
    id: 25, 
    language: 'SQL',
    lines: ['UPDATE students', 'SET grade = "A"', 'WHERE name BETWEEN "A" AND "M";'], 
    correct: 2 // Valid syntax, but often tricky: BETWEEN is inclusive (usually fine, but index-wise check)
  },
  { 
    id: 26, 
    language: 'JS',
    lines: ['const el = document.getElementByID("app");', 'el.innerHTML = "Hello";'], 
    correct: 0 // Should be getElementById (lowercase 'd')
  },
  { 
    id: 27, 
    language: 'JS',
    lines: ['setTimeout(playAudio(), 1000);', 'function playAudio() {', '  console.log("Playing");', '}'], 
    correct: 0 // Invokes immediately instead of passing the reference: should be setTimeout(playAudio, 1000)
  },
  { 
    id: 28, 
    language: 'JS',
    lines: ['const username = "Michael";', 'username = "Mike";', 'console.log(username);'], 
    correct: 1 // Cannot reassign a 'const' variable
  },
  { 
    id: 29, 
    language: 'JS',
    lines: ['const names = ["Alice", "Bob"];', 'names.push("Charlie");', 'console.log(names.length());'], 
    correct: 2 // .length is a property, not a function: should be names.length
  },
  { 
    id: 30, 
    language: 'JS',
    lines: ['const str = "hello";', 'str.push("!");', 'console.log(str);'], 
    correct: 1 // Strings do not have a .push() method
  },
  { 
    id: 31, 
    language: 'JS',
    lines: ['const data = JSON.parse({ id: 1 });', 'console.log(data.id);'], 
    correct: 0 // JSON.parse() expects a string, not an object
  },
  { 
    id: 32, 
    language: 'JS',
    lines: ['let count = 0;', 'if (count = 5) {', '  console.log("Five");', '}'], 
    correct: 1 // Using '=' (assignment) instead of '===' (comparison)
  },
  { 
    id: 33, 
    language: 'JS',
    lines: ['let user = null;', 'if (user.isActive) {', '  console.log("Active");', '}'], 
    correct: 1 // Cannot read property 'isActive' of null
  },
  { 
    id: 34, 
    language: 'JS',
    lines: ['class Dog {', '  constructor() {', '    super();', '  }', '}'], 
    correct: 2 // Cannot call super() if the class does not 'extend' another class
  },
  { 
    id: 35, 
    language: 'JS',
    lines: ['const nums = [1, 2, 3];', 'const doubled = nums.map(n => {', '  n * 2;', '});'], 
    correct: 2 // Missing 'return' statement inside the map block
  },
  { 
    id: 36, 
    language: 'Python',
    lines: ['my_list = [1, 2, 3]', 'my_list.add(4)', 'print(my_list)'], 
    correct: 1 // Lists use .append(), not .add()
  },
  { 
    id: 37, 
    language: 'Python',
    lines: ['x = 10', 'if x = 10:', '  print("Ten")'], 
    correct: 1 // Using '=' (assignment) instead of '==' (comparison)
  },
  { 
    id: 38, 
    language: 'Python',
    lines: ['try:', '  result = 10 / 0', 'finally', '  print("Done")'], 
    correct: 2 // Missing colon ':' after finally
  },
  { 
    id: 39, 
    language: 'Python',
    lines: ['word = "hello"', 'word[0] = "H"', 'print(word)'], 
    correct: 1 // Strings in Python are immutable; cannot assign to an index
  },
  { 
    id: 40, 
    language: 'Python',
    lines: ['total = 100', 'print("Length is: ")', 'print(len(total))'], 
    correct: 2 // Integers do not have a length (len() throws an error)
  },
  { 
    id: 41, 
    language: 'Python',
    lines: ['class Cat:', '  def meow():', '    print("Meow")'], 
    correct: 1 // Instance methods must include 'self' as the first parameter
  },
  { 
    id: 42, 
    language: 'Python',
    lines: ['is_active = True', 'if is_active == true:', '  print("Active")'], 
    correct: 1 // Booleans in Python are capitalized (True/False), 'true' is undefined
  },
  { 
    id: 43, 
    language: 'Python',
    lines: ['age = 25', 'message = "I am " + age + " years old"', 'print(message)'], 
    correct: 1 // Cannot concatenate string and integer directly; needs str(age)
  },
  { 
    id: 44, 
    language: 'Python',
    lines: ['try:', '  value = int("A")', 'except ValueError as e', '  print("Error")'], 
    correct: 2 // Missing colon ':' at the end of the except block
  },
  { 
    id: 45, 
    language: 'Python',
    lines: ['for i in range(5)', '  print(i)', 'print("Done")'], 
    correct: 0 // Missing colon ':' after the for loop statement
  },
  { 
    id: 46, 
    language: 'HTML',
    lines: ['<form>', '  <button href="/submit">Send</button>', '</form>'], 
    correct: 1 // Buttons do not use the 'href' attribute
  },
  { 
    id: 47, 
    language: 'HTML',
    lines: ['<picture>', '  <img src="photo.jpg" alt="Photo"></image>', '</picture>'], 
    correct: 1 // <img> is a self-closing tag; </image> does not exist
  },
  { 
    id: 48, 
    language: 'HTML',
    lines: ['<div>', '  <input type="checkbox" selected>', '  <label>Agree</label>', '</div>'], 
    correct: 1 // Checkboxes use 'checked', not 'selected'
  },
  { 
    id: 49, 
    language: 'HTML',
    lines: ['<head>', '  <script href="main.js"></script>', '</head>'], 
    correct: 1 // Scripts use 'src', not 'href'
  },
  { 
    id: 50, 
    language: 'HTML',
    lines: ['<footer>', '  <a src="https://google.com">Google</a>', '</footer>'], 
    correct: 1 // Anchor tags <a> use 'href', not 'src'
  },
  { 
    id: 51, 
    language: 'HTML',
    lines: ['<html>', '  <head>', '    <body>Title</body>', '  </head>', '</html>'], 
    correct: 2 // The <body> tag cannot be nested inside the <head> tag
  },
  { 
    id: 52, 
    language: 'HTML',
    lines: ['<div class="card">', '  <h1 id="title" id="main">Hello</h1>', '</div>'], 
    correct: 1 // Elements cannot have duplicate 'id' attributes
  },
  { 
    id: 53, 
    language: 'HTML',
    lines: ['<ul>', '  <div>', '    <li>List Item</li>', '  </div>', '</ul>'], 
    correct: 1 // A <ul> must only contain <li> tags as direct children, not <div>
  },
  { 
    id: 54, 
    language: 'HTML',
    lines: ['<head>', '  <meta charset="UTF-8">', '  <title>Home Page<title>', '</head>'], 
    correct: 2 // Missing the forward slash in the closing </title> tag
  },
  { 
    id: 55, 
    language: 'HTML',
    lines: ['<form action="/api/login" method="PUSH">', '  <input type="text">', '</form>'], 
    correct: 0 // PUSH is not a valid HTML form method (should be POST or GET)
  },
  { 
    id: 56, 
    language: 'CSS',
    lines: ['.btn {', '  background: blue;', '  border-radius: 5;', '}'], 
    correct: 2 // Missing units (e.g., px, em) for the border-radius value
  },
  { 
    id: 57, 
    language: 'CSS',
    lines: ['.text-danger {', '  color: #FF000;', '  font-size: 14px;', '}'], 
    correct: 1 // Hex colors must be 3, 4, 6, or 8 characters long
  },
  { 
    id: 58, 
    language: 'CSS',
    lines: ['.row {', '  display: flex;', '  flex-direction: horizontal;', '}'], 
    correct: 2 // 'horizontal' is not valid; it should be 'row'
  },
  { 
    id: 59, 
    language: 'CSS',
    lines: ['.hero {', '  background-image: "bg.png";', '  height: 100vh;', '}'], 
    correct: 1 // Background images must be wrapped in url()
  },
  { 
    id: 60, 
    language: 'CSS',
    lines: ['h2 {', '  font-size: 24px;', '  font-style: bold;', '}'], 
    correct: 2 // 'bold' is a value for font-weight, not font-style
  },
  { 
    id: 61, 
    language: 'CSS',
    lines: ['.modal {', '  position: absolute;', '  top: 10;', '}'], 
    correct: 2 // Missing units (like px or %) for the 'top' property
  },
  { 
    id: 62, 
    language: 'CSS',
    lines: ['/* Main styles //', 'body {', '  margin: 0;', '}'], 
    correct: 0 // Invalid CSS comment closure; should be */
  },
  { 
    id: 63, 
    language: 'CSS',
    lines: ['.overlay {', '  opacity: 0.5;', '  z-index: 10.5;', '}'], 
    correct: 2 // z-index must be an integer, not a decimal
  },
  { 
    id: 64, 
    language: 'CSS',
    lines: ['.fade {', '  opacity: 1;', '  transition: all 0.3s easily;', '}'], 
    correct: 2 // 'easily' is not a valid timing function; it should be 'ease'
  },
  { 
    id: 65, 
    language: 'CSS',
    lines: ['.box {', '  margin: 10px 20px 30px 40px 50px;', '  padding: 1rem;', '}'], 
    correct: 1 // Margin shorthand takes a maximum of 4 values (top, right, bottom, left)
  },
  { 
    id: 66, 
    language: 'SQL',
    lines: ['SELECT id, name', 'FROM users', 'WHERE deleted_at = NULL;'], 
    correct: 2 // In SQL, you must use 'IS NULL', not '= NULL'
  },
  { 
    id: 67, 
    language: 'SQL',
    lines: ['UPDATE profile', 'SET username = "mike" AND age = 22', 'WHERE id = 1;'], 
    correct: 1 // The SET clause separates columns with commas, not 'AND'
  },
  { 
    id: 68, 
    language: 'SQL',
    lines: ['SELECT department, COUNT(*)', 'FROM employees', 'GROUP BY department', 'WHERE status = "active";'], 
    correct: 3 // The WHERE clause must come BEFORE the GROUP BY clause
  },
  { 
    id: 69, 
    language: 'SQL',
    lines: ['DELETE *', 'FROM sessions', 'WHERE expired = true;'], 
    correct: 0 // It should be 'DELETE FROM', the '*' is invalid syntax
  },
  { 
    id: 70, 
    language: 'SQL',
    lines: ['INSERT INTO settings', 'VALUES "dark_mode", true;'], 
    correct: 1 // Values must be enclosed in parentheses: VALUES ("dark_mode", true)
  },
  { 
    id: 71, 
    language: 'SQL',
    lines: ['SELECT MAX(score), player_id', 'FROM leaderboard', 'ORDER BY score;'], 
    correct: 0 // Selecting an aggregate function alongside a column requires a GROUP BY clause
  },
  { 
    id: 72, 
    language: 'SQL',
    lines: ['DROP ROW', 'FROM products', 'WHERE id = 99;'], 
    correct: 0 // 'DROP ROW' is invalid; it should be 'DELETE FROM'
  },
  { 
    id: 73, 
    language: 'SQL',
    lines: ['SELECT username', 'FROM accounts', 'WHERE role == "admin";'], 
    correct: 2 // SQL uses a single '=' for equality comparison, not '=='
  },
  { 
    id: 74, 
    language: 'SQL',
    lines: ['ALTER TABLE users', 'ADD COLUMN age INT', 'DEFAULT "twenty";'], 
    correct: 2 // Type mismatch: providing a string default for an INT column
  },
  { 
    id: 75, 
    language: 'SQL',
    lines: ['SELECT count()', 'FROM messages', 'WHERE read = false;'], 
    correct: 0 // count() requires an argument, usually count(*) or count(column_name)
  }
];