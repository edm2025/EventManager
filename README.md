# EventManager

STEP-BY-STEP EXPLANATION
1. Install Prerequisites
a. Node.js
Node.js is the JavaScript runtime needed to run the backend code.

Requirement: Version 16 or later

📥 Download it here: https://nodejs.org/

b. PostgreSQL
PostgreSQL is the database used to store data for the application.

📥 You can download and install PostgreSQL from: https://www.postgresql.org/download/


2. Setup Database
After installing PostgreSQL:

Open pgAdmin or any other DB GUI

Create a new database (e.g., eventdb)

Make note of:

Host (usually localhost)

Port (default is 5432)

Username (default is postgres)

Password

Database name (eventdb, for example)

3. Configure Environment Variables
In the root folder (same level as package.json), create a file named .env

Add this to the .env file (adjust values accordingly):

ini
Copy
Edit
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database
SESSION_SECRET=your_secure_random_string
REPLIT_DOMAINS=localhost,127.0.0.1
REPL_ID=local_development

4. Install Dependencies
Open your terminal or command prompt

Navigate to the project directory:

bash
Copy
Edit
cd path/to/project
Then run:

bash
Copy
Edit
npm install
This will install all the libraries required for the app.

5. Initialize Database Schema
This command sets up the tables in your PostgreSQL database:

bash
Copy
Edit
npm run db:push
This usually uses Prisma or an ORM (Object-Relational Mapper) to push the schema defined in the project files to your database.

6. Start the Application
Run:

bash
Copy
Edit
npm run dev
If all goes well, you should be able to open:

arduino
Copy
Edit
http://localhost:5000
7. Login Setup
The app is set up for Replit authentication, which is meant for deployment on Replit.com.

For local use, it may not work unless you:

Replace Replit login with something like email/password or Google OAuth

OR register a Replit OAuth client and simulate authentication (complex)




