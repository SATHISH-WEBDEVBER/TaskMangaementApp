// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const Task = require('./models/Task');
// require('dotenv').config();

// const app = express();
// const PORT = 5000;

// // Middleware (Allows frontend to talk to backend)
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// // ensure your mongoDB is running locally or use a cloud URI
// mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/daily_task_db')
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error('MongoDB Connection Error:', err));

// // --- ROUTES ---

// // 1. GET Tasks (Filtered by Date)
// app.get('/tasks', async (req, res) => {
//   const { date } = req.query;
//   try {
//     const tasks = await Task.find({ date }).sort({ isCompleted: 1, createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // 2. ADD Task
// app.post('/tasks', async (req, res) => {
//   try {
//     const newTask = new Task(req.body);
//     const savedTask = await newTask.save();
//     res.json(savedTask);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // 3. UPDATE Task (Complete/Edit)
// app.put('/tasks/:id', async (req, res) => {
//   try {
//     const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updatedTask);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // 4. DELETE Task
// app.delete('/tasks/:id', async (req, res) => {
//   try {
//     await Task.findByIdAndDelete(req.params.id);
//     res.json({ message: "Deleted" });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

app.get('/tasks', async (req, res) => {
  const { date } = req.query;
  try {
    const tasks = await Task.find({ date }).sort({ isCompleted: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    const saved = await task.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
