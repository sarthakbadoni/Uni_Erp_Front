# Fixing the Broken University ERP Experience

## Problem set

This project is being built for the **S1 – WEBAPP** problem set.

> Build any product with a clean web or mobile interface. Focus on data flow, backend APIs, authentication, and real-time interactions. Solutions should feel production-ready with stable routing and storage layers.

Our ERP fits S1 because:
- It has a clean, responsive **web interface** built with React.
- It already uses **backend APIs** on AWS EC2, with DynamoDB and S3 as storage.
- It focuses on **stable routing** (React SPA) and a **production-style** architecture instead of a toy demo.

---------------------------------------------------------------

## Problem statement

Most universities rely on ERP systems that are supposed to quietly handle everything in the background – attendance, results, fees, exam forms, notices, you name it. In reality, these systems usually start struggling the moment real traffic shows up.

During peak times like:
- Online exam registrations
- Result announcements
- Fee payment deadlines

students and faculty end up facing:
- Pages that take forever to load or just time out  
- Systems that crash in the middle of important forms  
- Clunky flows where every single click reloads a new heavy page  

Instead of making campus life smoother, the ERP often:
- Causes missed deadlines and half-submitted forms  
- Creates long queues at admin offices because “the server is down again”  
- Wastes time for staff who have to juggle complaints and manual workarounds  

This project is our attempt to fix that experience instead of just accepting it as “normal”.

---------------------------------------------------------------

## Why this project exists

If you ask students or faculty about their ERP, you usually get a similar reaction:  
it’s slow, awkward to use, and it tends to fail exactly when everyone needs it.

On result days, exam form days, and last fee dates, the pattern repeats:
- Simple pages suddenly take ages to load.  
- You get logged out, hit with random errors, or the site just stops responding.  
- Every action feels like a mini-journey: click → redirect → full reload → wait → maybe error.  

A system that’s supposed to be the digital backbone of a university ends up causing:
- Delayed registrations and messed up timelines  
- Extra pressure on admin staff who have to deal with the fallout  
- A general feeling that “the system” is something to fight with, not rely on  

This project came out of that frustration.  
We didn’t want yet another fancy screen on top of a slow base – we wanted the base itself to feel solid and modern.

---------------------------------------------------------------

## What we are building instead

We’re building a **fast, modern, cloud-native university ERP** that’s designed to behave properly under real-world usage, not just in ideal conditions.

### Frontend: React SPA with proper routing

- The UI is built as a **single page application** using React.  
- Navigation between modules (attendance, exams, results, fees, etc.) happens through client-side routing, not full page reloads.  
- That means no more “click → spinner → redirect → new blank page → maybe content”.  
- Because the entire layout isn’t reloaded on every action, the app feels much more responsive, even on average networks.

The design is **modular and modern**:
- Dashboard cards, tables, forms, and panels are implemented as reusable components.  
- The layout is fully responsive and tested across laptops, tablets, and phones.  
- The idea is not just to make it “work”, but to make it feel like something students and staff won’t hate opening.  

---------------------------------------------------------------

## Backend and infrastructure: built to scale, not to collapse

University usage isn’t flat or predictable.  
Most of the time the load is normal, and then suddenly everyone hits the system at once: exam forms opening, results going live, or fee deadlines.

We’ve designed the backend around that kind of usage instead of pretending it doesn’t happen.

### AWS EC2 for compute

- The backend runs on **AWS EC2**, instead of a single fixed on‑prem server.  
- When traffic spikes, the system can be scaled horizontally or vertically.  
- The goal is to handle peak loads without turning the ERP into a waiting room.  

### DynamoDB for core data

- Core data (students, courses, attendance, results, fee records, etc.) is stored in **Amazon DynamoDB**.  
- DynamoDB is built for low-latency reads and writes at scale, which is exactly what an ERP needs when thousands of users hit it in a short time window.  
- The intent is to avoid constantly nursing the database during exam seasons just to keep things running.  

### S3 for files

- Documents such as admit cards, marksheets, notices, and other static assets are stored in **Amazon S3**.  
- This offloads heavy file traffic from the application server.  
- Even when many students are downloading documents at the same time, the app is designed to stay responsive.  

In simple terms:  
Traditional ERPs treat traffic spikes as a headache; we treat them as a base requirement.

---------------------------------------------------------------

## Making it feel like a real app: PWA and UX

We’re not aiming for “just another website with forms”.  
The goal is to make something that feels like an app you can open quickly and rely on on a daily basis.

### PWA (Progressive Web App) – planned

We’re working on adding **PWA support** so the ERP can be installed directly on phones and desktops from the browser.

What this will enable:
- Installable app with its own icon, splash screen, and standalone window.  
- Caching via service workers so important views load quickly, even on weak or unstable networks (like hostel Wi‑Fi).  
- A more reliable experience during peak times, instead of the whole thing feeling fragile.  

For students and faculty, that translates to:
- Opening the ERP like a normal app, without hunting for the URL each time.  
- Faster access to attendance, results, notifications, and other core features.  
- Less chance of a tiny network glitch completely breaking a session.  

### Modern, modular UI

- Clean, readable typography and layouts that work well with dense academic data.  
- Modular sections so universities can turn modules on/off or rearrange things based on their needs.  
- A focus on avoiding the classic “one giant table with tiny text and ten filters” pattern everywhere.  

The ERP is being built to feel like it was actually designed with real users in mind, not just database fields.

---------------------------------------------------------------

## Current progress (Hackathon – Round 1)

This isn’t just an idea on slides – a good chunk of it is already implemented and running.

What’s done so far:
- The main flows showcased in the demo are live and working smoothly.  
- The site is responsive and has been checked on multiple devices and screen sizes.  
- Roughly **half of the backend API endpoints** are already implemented and wired into the frontend.  
- The app is deployed on **AWS EC2 + DynamoDB + S3**, and for the modules that exist, it runs fast and feels stable in testing.  

From our testing so far:
- Navigation between sections feels instant thanks to React routing.  
- There are no random full-page reloads for simple actions.  
- The finished parts behave more like a real product than a quick hack.  

Demo video link:  
`https://drive.google.com/file/d/1l0t6YZ99RNTzE2yT_DiJyQyueOVngCpq/view`

---------------------------------------------------------------

## What is left before the final round

There’s still work to be done, and that’s what we’re focusing on before the last round of the hackathon.

Planned work:
- **Make everything fully dynamic**  
  - Some sections are still hard-coded for this round’s demo.  
  - These will be connected fully to backend APIs and the database so all content comes from real data instead of placeholders.  
- **Complete all major API endpoints**  
  - Finish the remaining core modules: results, attendance, fees, notifications, roles, and more.  
- **Finish PWA support**  
  - Add the web app manifest, service worker, and proper caching strategies so the system is installable and more resilient on slow or unstable networks.  
- **Polish and harden the system**  
  - Improve edge cases, error states, loading indicators, and overall feedback.  
  - Push it closer to something that a university could actually deploy, not just something that looks good in a demo.  

---------------------------------------------------------------

## Why this project actually matters

This isn’t a “hello world” ERP or a simple CRUD project done for marks.

It tries to solve a real, everyday problem:
- Universities invest in ERP systems that let them down at the worst possible times.  
- Students and staff end up working around the system instead of with it.  
- “Server down” has become a running joke on campus when it should be rare.  

By combining:
- A React SPA with fast client-side routing  
- A modular, responsive, modern UI  
- AWS EC2 for scalable compute  
- DynamoDB for scalable data storage  
- S3 for reliable file handling  
- And upcoming PWA support for an app-like experience  

this project aims to build a university ERP that is meant to **stay up**, **stay fast**, and **scale** with real-world usage, instead of collapsing exactly when it’s most needed.

It’s the kind of system we wish our own universities actually had.
