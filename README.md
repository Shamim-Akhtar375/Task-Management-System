# TaskFlow: Team Task Manager

🚀 **Live Demo**: [https://task-management-system-production-f63c.up.railway.app](https://task-management-system-production-f63c.up.railway.app)

TaskFlow is a premium, full-stack team management application designed with a futuristic dark glassmorphism aesthetic. It empowers teams to collaborate seamlessly with real-time activity tracking, interactive data visualizations, and an intuitive Kanban-style workflow.

<img width="1918" height="853" alt="image" src="https://github.com/user-attachments/assets/54767000-910c-474b-b3d2-c9401fd50960" />
<img width="1913" height="586" alt="image" src="https://github.com/user-attachments/assets/88416cbd-61f6-4815-ad98-52a4d263b664" />






## 🚀 Key Features

- **Dynamic Dashboard**: Interactive charts using Recharts for task distribution and productivity trends.
- **Kanban Board**: Drag-and-drop style task management across statuses (To Do, In Progress, In Review, Done).
- **Real-Time Activity Feed**: Stay updated with every action your team takes—creating tasks, updating statuses, or commenting.
- **Project Management**: Create, update, and manage multiple projects with custom color-coding and descriptions.
- **Team Collaboration**: Shared workspace with role-based member management.
- **Profile & Settings**: Customizable user profiles with accent color themes and secure password management.
- **Responsive Design**: Fully optimized for all screen sizes with a premium glassmorphic UI.

## 🛠️ Tech Stack

### Frontend
- **React + Vite**: For a lightning-fast development experience.
- **Tailwind CSS**: Custom-styled utility-first CSS.
- **React Query**: For efficient server-state management and caching.
- **Recharts**: Beautiful, interactive data visualizations.
- **Lucide React**: Sleek, modern icons.

### Backend
- **Node.js + Express**: Scalable and robust server-side architecture.
- **PostgreSQL / SQLite**: Powered by **Prisma ORM** for type-safe database queries.
- **JWT Authentication**: Secure access with access and refresh tokens.
- **Bcrypt**: Industrial-grade password hashing.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shamim-Akhtar375/Task-Management-System.git
   cd Task-Management-System
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file and add your DATABASE_URL and JWT_SECRET
   npx prisma db push
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file and add VITE_API_URL=http://localhost:3000/api
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [Shamim Akhtar](https://github.com/Shamim-Akhtar375)
