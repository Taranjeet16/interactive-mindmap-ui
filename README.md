Interactive Mindmap UI

A data-driven, interactive mindmap visualization built with React and React Flow.
This project demonstrates how hierarchical data can be explored, edited, and visualized through a clean, intuitive UI with rich interactions.

Made by Taranjeet

Deployment Link-:https://mindmap-ui-five.vercel.app/

🎯 Project Overview

This project was built as part of a Frontend Development Internship assignment.

The goal of the assignment was to evaluate the ability to:

Build complex, interactive user interfaces

Work with data-driven visualizations

Design a clean and intuitive UX

Structure frontend code in a scalable and maintainable way

The application visualizes hierarchical data as an interactive mindmap, allowing users to explore, edit, and understand relationships between nodes.

✨ Features

Fully data-driven rendering

Entire mindmap is generated from a JSON file

Hierarchical visualization

Parent → child → deeper-level relationships

Expand / Collapse functionality

Per-node and toolbar controls

Hover tooltips

Quick summaries shown on hover

Right-side detail panel

Displays detailed node information and metadata

Inline editing

Edit node title and description directly from the UI

Zoom, Pan & Fit-to-View

Smooth navigation across large mindmaps

Clear visual hierarchy

Level-based node colors (root, child, deeper levels)

🛠 Tech Stack
Frontend

React

React Flow – graph and mindmap visualization

TypeScript

Tailwind CSS

Data

JSON – single source of truth for the mindmap structure

Backend, authentication, and persistence are intentionally excluded as this is a frontend-focused assignment.

🧠 Architecture & Data Flow

The application follows a purely data-driven architecture:

mindmapData.json
      ↓
Data parsing & transformation
      ↓
React state management
      ↓
React Flow nodes & edges
      ↓
Interactive Mindmap UI

Key Principles

No nodes or hierarchy are hardcoded in JSX

All content and structure come from JSON

UI updates automatically when the JSON data changes

UI state (selection, expansion, editing) is handled separately from data

📂 Data-Driven Rendering (Important)

The entire mindmap is generated from:

src/data/mindmapData.json

Examples:

Add a node in JSON → it appears in the UI

Update text in JSON → hover tooltip & side panel update

Change hierarchy → visual structure updates automatically

No UI logic changes are required.

🖼 Screenshots

The /screenshots folder includes:

Full Mindmap View – Fit-to-view applied

Hover Tooltip – Summary displayed on hover

Node Selection & Side Panel – Detailed view with editing

Expanded vs Collapsed States – Hierarchy interaction

🎥 Demo Video

A short screen-recorded demo showcasing:

Zoom & pan

Hover tooltips

Expand / collapse behavior

Node selection & side panel

Inline editing

Fit-to-view

🔗 Demo Video Link:
https://drive.google.com/file/d/1Mb0QV3HFvzzD9HqvogtxAaBR0vMhhjqf/view?usp=sharing

The demo video is also included inside the /screenshots folder for reference.

📁 Reference Images

The images provided in the assignment brief are included in the /reference folder.

These images were used only as behavioral and interaction references
(e.g., expand/collapse patterns, side panel layout),
not for copying content or implementation.
