# Contributing to Prelude

## Welcome

Thank you for your interest in contributing to **Prelude**, a full-stack travel booking web app (an Expedia clone built with React, Redux, and Firebase). We're glad to have you here and look forward to working with you. Whether you're reporting a bug, fixing one, or suggesting a new feature, your contributions are welcome and appreciated. Please take time to read the following guide to ensure your contributions are up to project standards and maximally beneficial for users!

## Table of Contents

- [Welcome](#welcome)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [How to Report a Bug](#how-to-report-a-bug)
- [How to Fix a Bug](#how-to-fix-a-bug)
- [How to Suggest Enhancements](#how-to-suggest-enhancements)
- [How to Submit Changes](#how-to-submit-changes)
- [Coding Conventions and Style Guide](#coding-conventions-and-style-guide)
- [Where to Get Help](#where-to-get-help)
- [Project Owners and Contributors](#project-owners-and-contributors)
- [Reference Files](#reference-files)

## Getting Started

1. Clone the repository:

```bash
   git clone https://git.ece.iastate.edu/clink1/prelude-team1-s26.git
   cd prelude-team1-s26
```

   > **Note:** Pushing and pulling to the Iowa State ECE GitLab server requires being connected to the ISU network (VPN) with an active personal access token (PAT) configured in the ECE GitLab instance. Local development and commits will work offline.

2. Install dependencies:

```bash
   npm install
```

3. Run the app locally:

```bash
   npm start
```

   The app runs at `http://localhost:3000`. If port 3000 is already in use, accept the prompt to run on another port (e.g. 3001).

4. (Optional) Start the local data server in a second terminal tab. This is the fallback if Firebase is not available:

```bash
   npm run server
```

## Development Environment

Full setup and installation details, including Firestore configuration and the JSON-Server fallback, are documented in the [README.md](./README.md). Please read it before setting up your environment. In short, you will need:

- **Node.js and npm** (for running the React app and installing dependencies)
- A **Firebase project** (the repo is preconfigured for project `prelude-2c284`. See the README's Firestore section to use your own)
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

If you'd like to fix a bug:

1. Comment on the relevant issue so others know you're working on it.
2. Follow the [How to Submit Changes](#how-to-submit-changes) workflow below.
3. Focus on bugs labeled `good first issue` or `help wanted` if you're new to the project.
4. Make sure your fix doesn't break existing features. Use unit tests to verify individual functions and integration tests to verify the complete data flow before submitting changes.
5. Open a merge request against `main` with your fixes applied and request a review from the code owners. A member from Team 1 will take a look and suggest any necessary changes before approving and pulling the changes into production.

## How to Suggest Enhancements

Have an idea for a new feature or improvement? We'd love to hear it.

1. Check existing [issues](https://git.ece.iastate.edu/clink1/prelude-team1-s26/-/issues) to see if it's already been suggested or implemented.
2. Open a new issue labeled `enhancement`.
3. Describe the enhancement in detail: what it does, why it's useful, and how it might work.
4. Be as specific as possible: mockups, examples, or references to similar features in other applications help prospective implementors.
5. If a code owner closes out an issue as duplicate or not feasible and you feel this was an incorrect assessment, please reach out to `clink1@iastate.edu`, `connorwm@iastate.edu`, `alecm5@iastate.edu`, or `celopez@iastate.edu` to take another look.

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

3. Make your changes, then stage, commit, and push to your branch:

```bash
   git add .
   git commit -m "This should be a helpful commit message"
   git push
```

4. Open a merge request against `main` with this feature branch and flag it as ready for review. One or more project owners will hand-review code for quality assurance purposes before merging. Being responsive to changes requested will expedite the process of getting your code into production.

## Coding Conventions and Style Guide

Please preserve good separation of concerns with folder structure. If you are adding to an existing feature, place source files in the corresponding directory. If you are creating a new feature, create a new directory for them.

Prefer Chakra UI components and font-awesome styling where possible; only use native CSS where necessary. Please test user interface changes on both desktop- and mobile-sized browsers and verify there are no new concerns with accessibility. WAVE is one helpful tool to diagnose automatically such issues.

Use only JavaScript for business logic. Although the project does not enforce specific style guides for formatting, maintaing the existing indentation, bracing structure, and multi-part statement line breaks will aid legibility and reduce the amount of rework required at the merge request stage before getting new code into production. Prefer shorter functions that can "self-document" and prefer unit testing for every new function added. 

The project happily accepts new merge requests merely that add additional test cases, even if they reveal new underlying bugs.

## Where to Get Help

Provided documentation in this file, the README, and comments within the source code files should help to get started. 

Reach out to any of the team members `clink1@iastate.edu`, `connorwm@iastate.edu`, `alecm5@iastate.edu`, or `celopez@iastate.edu` for assistance in setting up or contributing to Prelude.

## Project Owners and Contributors

Connor Link - clink1@iastate.edu (Computer Engineering)
Connor Moroney - connorwm@iastate.edu (Computer Engineering)
Alec Moore - alecm5@iastate.edu (Software Engineering)
Chris Lopez - celopez@iastate.edu (Software Engineering)

## Reference Files

`package.json` - List of project dependencies. Prefer not to introduce new dependencies for new features or bug fixes unless absolutely necessary or otherwise sensible.

`README.md` - Step-by-step guidance for project setup.

`CONTRIBUTING.md` - Guidelines for new open-source project contributors to follow.

`src/App.js` - Main SPA wrapper for react. Handled by react-router-dom for client-side navigation.

`src/01_firebase/config_firebase.js` - Main configuration file for the Firebase/Firestore instance. Set the corresponding fields to a new test project in Firebase for development purposes.
