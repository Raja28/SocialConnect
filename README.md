# 🌐 SocialConnect

Welcome to **SocialConnect**! This is a modern, full-stack social media application built with **Next.js**, **TypeScript**, and **Supabase**. SocialConnect enables users to share their stories, interact through likes and comments, and discover a personalized feed of content in a sleek, responsive interface.

---

## Demo Link
Visit the website: [SocialConnect](https://social-connect-flame.vercel.app/)

## Demo Video
Watch the short video (5 mins): [Loom Video](https://www.loom.com/share/633b0fb73ee043f68a35407bb0e8ebe5)

## 📦 Project Overview

SocialConnect is designed to be a scalable social platform where users can:
- **Authenticate** securely using JWT and Supabase.
- **Create and Manage** text-based posts with high-quality image support.
- **Interact** with the community via a real-time like and comment system.
- **Customize Profiles** with bios, avatars, and location data.
- **Navigate** a personalized, chronological content feed.

---

## 🧰 Tech Stack

- **Frontend Framework:** Next.js
- **Language:** TypeScript
- **Styling & UI:** Tailwind CSS
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT-based
- **Deployment:** Vercel

---

## 🚀 Key Features

### 🔐 Authentication System
- Secure **JWT-based** login, registration, and logout.
- Username validation (3-30 chars, alphanumeric + underscores).


### 👤 User Profiles
- **Profile Management:** Users can view any profile and update their own bio (160 char limit), website, and location.
- **Post Management:** Users can view any post, update and delete.

---

# 🛠️ SocialConnect API Documentation

All API endpoints are prefixed with `/api`. Most endpoints require a valid JWT token passed in the Authorization header.

---

### 🔐 Authentication
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/register` | `POST` | Create a new user account. |
| `/auth/login` | `POST` | Authenticate user and return access token + profile data. |
| `/auth/logout` | `POST` | Invalidate the current token. |

---

### 📰 Feed & Content
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/feed` | `GET` | Get a list of public posts. |
| `/posts` | `GET` | List all public posts. |
| `/posts` | `POST` | Create a new post (text + image URL). |
| `/posts/my` | `GET` | Retrieve all posts created by the authenticated user. |
| `/posts/[post_id]` | `GET` | Get specific post details. |
| `/posts/[post_id]` | `PUT/PATCH`| Update your own post content. |
| `/posts/[post_id]` | `DELETE` | Remove your own post. |

---

### 💬 Social Interactions
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/posts/[post_id]/like` | `POST` | Add a like to a post. |
| `/posts/[post_id]/like` | `DELETE` | Remove a like from a post. |
| `/posts/[post_id]/comments` | `GET` | List all comments for a specific post. |
| `/posts/[post_id]/comments` | `POST` | Add a new comment to a post. |
| `/posts/[post_id]/comments/[comment_id]` | `DELETE` | Delete your own comment. |

---

### 👤 User Management
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/user/me` | `GET` | Get current authenticated user's profile and stats. |
| `/user/me` | `PUT/PATCH`| Update bio, location, website, or avatar URL. |
| `/users/[user_id]/follow` | `POST` | Follow a specific user. |
| `/users/[user_id]/follow` | `DELETE` | Unfollow a specific user. |
| `/users/[user_id]/followers` | `GET` | List all users following this user. |
| `/users/[user_id]/following` | `GET` | List all users this user is following. |

---

### Installation

1. **Clone the repository:**
```
git clone: https://github.com/Raja28/SocialConnect.git
npm install
npm run dev
```