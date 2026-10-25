# Support Ticketing Tool

A full-stack web application for managing and tracking support tickets.

## Technologies Used

* **Frontend:** React.js, HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Version Control:** Git and GitHub

## Features

* Create support tickets
* View all tickets
* Search for tickets
* Update ticket status
* Delete tickets
* Store ticket information in a MySQL database
* Responsive user interface

## Project Structure

```text
ticketing-tool/
├── frontend/
├── backend/
├── .gitignore
└── README.md
```

## Prerequisites

* Node.js and npm
* MySQL Server
* MySQL Workbench
* Visual Studio Code

## Setup Instructions

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ticketing-tool
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Configure the Database

Create a MySQL database named `ticketflow_db` and a table named `tickets`.

Configure your database connection using environment variables in `backend/.env`.

Do not upload your `.env` file or database password to GitHub.

### 3. Start the Backend

Open a terminal in the backend folder and run:

```bash
npm install
node server.js
```

### 4. Start the Frontend

Open another terminal in the frontend folder and run:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Project Status

The application is under development. Database integration and API functionality are being tested.

## Author

Stella Mary

## Purpose

This project is developed as part of a Full Stack Development internship to gain practical experience in frontend development, backend APIs, database integration, and version control.
