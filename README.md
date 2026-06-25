<!-- Moonlit Records README -->

<p align="center">
  <img src="./assets/moonlit-records-logo.png" alt="Moonlit Records Logo" width="260"/>
</p>

<h1 align="center">🌙 Moonlit Records</h1>

<p align="center">
  A backend-driven record shop application where users can browse vinyl records, place orders, and interact with store data through API functionality.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-Backend-blue?style=for-the-badge&logo=openjdk" />
  <img src="https://img.shields.io/badge/REST_API-Store_Logic-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Postman-API_Testing-orange?style=for-the-badge&logo=postman" />
  <img src="https://img.shields.io/badge/GitHub-Portfolio_Project-black?style=for-the-badge&logo=github" />
</p>

---

## ✨ Project Overview

**Moonlit Records** is a record shop application designed to simulate a modern vinyl storefront experience.  
The project focuses on backend development, API functionality, and real-world store operations such as browsing records, managing inventory, and placing orders.

This project was built to strengthen my skills in:

- Java application development
- REST API concepts
- Backend logic
- Store/order functionality
- GitHub project documentation
- Building software around a real business idea

---

## 🌌 Brand Concept

Moonlit Records combines a love for music, design, and backend development.

The logo is inspired by:

- 🌙 A crescent moon  
- 💿 A vinyl record  
- ⭐ A glowing star  
- 🌌 A dreamy midnight record shop aesthetic  

The goal was to make the project feel like a real product, not just a class assignment.

---

## 🛍️ Features

- Browse vinyl records
- View record details
- Place customer orders
- Manage record inventory
- Interact with store data through API endpoints
- Practice backend store logic
- Build a clean project structure for future expansion

---

## 🛠️ Tech Stack

| Technology | Purpose |
|----------|---------|
| Java | Backend application logic |
| REST API | Communication between client and server |
| JSON | Data formatting |
| Postman | API testing |
| Git | Version control |
| GitHub | Project hosting and documentation |
| IntelliJ IDEA | Development environment |
| SQL / MySQL | Database support, if used |

> Note: Update this table if your final project uses different tools.

---

## 🔌 API Functionality

Moonlit Records includes API-driven functionality to support record shop operations.

### Example API Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| `GET` | `/records` | View all vinyl records |
| `GET` | `/records/{id}` | View one record by ID |
| `POST` | `/orders` | Create a new customer order |
| `PUT` | `/inventory/{id}` | Update inventory information |
| `DELETE` | `/records/{id}` | Remove a record from the shop |

> Replace these with your real endpoints once your API is complete.

---

## 🧪 Sample API Response

```json
{
  "id": 1,
  "title": "Midnight Groove",
  "artist": "Luna Sound",
  "genre": "R&B",
  "price": 29.99,
  "inStock": true
}
