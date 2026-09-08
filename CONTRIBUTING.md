# Contributing to Prelude

## Welcome

Thank you for your interest in contributing to **Prelude** — a full-stack travel booking web app (an Expedia clone built with React, Redux, and Firebase). We're glad to have you here and look forward to working with you. Whether you're reporting a bug, fixing one, or suggesting a new feature, your contributions are welcome and appreciated.

## Table of Contents

- [Welcome](#welcome)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [How to Report a Bug](#how-to-report-a-bug)
- [How to Fix a Bug](#how-to-fix-a-bug)
- [How to Suggest Enhancements](#how-to-suggest-enhancements)
- [How to Submit Changes](#how-to-submit-changes)
- [Coding Conventions and Style Guide](#coding-conventions-and-style-guide)
- [Dependencies](#dependencies)
- [Code of Conduct](#code-of-conduct)
- [Recognition](#recognition)
- [Where to Get Help](#where-to-get-help)
- [Project Owners and Contributors](#project-owners-and-contributors)
- [Reference Files](#reference-files)

## Getting Started

1. Clone the repository:

```bash
   git clone https://git.ece.iastate.edu/clink1/prelude-team1-s26.git
   cd prelude-team1-s26
```

   > **Note:** Pushing and pulling to the Iowa State ECE GitLab server requires being connected to the ISU network (VPN). Local development and commits work offline.

2. Install dependencies:

```bash
   npm install
```

3. Run the app locally:

```bash
   npm start
```

   The app runs at `http://localhost:3000`. If port 3000 is in use, accept the prompt to run on another port (e.g. 3001).

4. (Optional) Start the local data server in a second terminal tab:

```bash
   npm run server
```

## Development Environment

Full setup and installation details — including Firestore configuration and the JSON-Server fallback — are documented in the [README.md](./README.md). Please read it before setting up your environment. In short, you will need:

- **Node.js and npm** (for running the React app and installing dependencies)
- A **Firebase project** (the repo is preconfigured for project `prelude-2c284`; see the README's Firestore section to use your own)
- The **ISU VPN** to push or pull from the GitLab server

## How to Report a Bug

Before reporting, please check the [GitLab Issues](https://git.ece.iastate.edu/clink1/prelude-team1-s26/-/issues) tab to see if the bug has already been reported.

To report a new bug, open an issue and include:

- **What you expected to happen**
- **What actually happened**
- **Steps to reproduce** the problem
- **Error messages or screenshots**, if any
- Your **environment** (browser, OS, Node version)

## How to Fix a Bug

If you'd like to fix a bug (not just report it):

1. Comment on the relevant issue so others know you're working on it.
2. Follow the [How to Submit Changes](#how-to-submit-changes) workflow below.
3. Focus on bugs labeled `good first issue` or `help wanted` if you're new to the project.
4. Make sure your fix doesn't break existing features — test the affected flow before submitting.

## How to Suggest Enhancements

Have an idea for a new feature or improvement? We'd love to hear it.

1. Check existing [issues](https://git.ece.iastate.edu/clink1/prelude-team1-s26/-/issues) to see if it's already been suggested or implemented.
2. Open a new issue labeled `enhancement`.
3. Describe the enhancement in detail: what it does, why it's useful, and how it might work.
4. Be as specific as possible — mockups, examples, or references to similar features help.

## How to Submit Changes

We use a branch-and-merge-request workflow. Please do **not** push directly to `main`.

1. Pull the latest changes before starting:

```bash
   git pull origin main
```

2. Create a branch with a short, descriptive name:

```bash
   git checkout -b feature/hotel-filter
```

3. Make your changes, then stage and commit:

```bash
   git add .
   git