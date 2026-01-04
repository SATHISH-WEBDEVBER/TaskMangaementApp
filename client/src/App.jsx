import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Trash2, Check, LogOut, Calendar, Plus, X, AlertTriangle } from 'lucide-react';

const API_URL = "https://taskmangaementapp.onrender.com/tasks";
const APP_PASSWORD = "MSr@1589"; 

function App() {
  // --- STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  
  // Notification & Modal States
  const [notification, setNotification] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null); // <--- New State for Delete Modal

  // --- HELPER: SHOW NOTIFICATION ---
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000); 
  };

  // --- AUTH & DATA LOGIC (UNCHANGED) ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      fetchTasks(selectedDate);
    } else {
      alert("Wrong Password!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    setTasks([]);
  };

  useEffect(() => {
    if (isAuthenticated) fetchTasks(selectedDate);
  }, [selectedDate, isAuthenticated]);

  const fetchTasks = async (date) => {
    try {
      const res = await axios.get(`${API_URL}?date=${date}`);
      setTasks(res.data);
    } catch (error) { console.error(error); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await axios.post(API_URL, { title: newTaskTitle, date: selectedDate });
      setTasks([res.data, ...tasks]);
      setNewTaskTitle("");
    } catch (error) { console.error(error); }
  };

  const toggleComplete = async (task) => {
    try {
      if (!task.isCompleted) {
        showNotification(`"${task.title}" is complete`);
      }
      const res = await axios.put(`${API_URL}/${task._id}`, { isCompleted: !task.isCompleted });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (error) { console.error(error); }
  };

  // --- NEW DELETE LOGIC (NO POPUP) ---
  // 1. Open the custom modal
  const promptDelete = (id) => {
    setTaskToDelete(id);
  };

  // 2. Actually delete after user clicks "Yes" in modal
  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await axios.delete(`${API_URL}/${taskToDelete}`);
      setTasks(tasks.filter(t => t._id !== taskToDelete));
      setTaskToDelete(null); // Close modal
      showNotification("Task deleted");
    } catch (error) { console.error(error); }
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { title: editTitle });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
      setEditingId(null);
    } catch (error) { console.error(error); }
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 w-full max-w-sm shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-2">My Space</h1>
          <form onSubmit={handleLogin} className="space-y-4 mt-6">
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-center tracking-widest text-xl focus:outline-none focus:border-purple-400 transition"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Passcode"
              autoFocus
            />
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-purple-700 to-teal-700 text-white font-sans selection:bg-pink-500 relative overflow-x-hidden">
      
      {/* 1. CUSTOM DELETE MODAL (REPLACES BROWSER POPUP) */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900/90 border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center transform scale-100 transition-all">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete this task?</h3>
            <p className="text-white/50 mb-6 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition font-medium w-full"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition font-bold shadow-lg shadow-red-500/30 w-full"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUCCESS NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 border-2 border-white/20">
            <Check size={20} />
            {notification}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Today's Tasks</h1>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
            <Calendar size={16} className="text-pink-300" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm" 
            />
          </div>
          <button onClick={handleLogout} className="bg-white/10 p-2 rounded-full hover:bg-red-500/20 transition">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        
        {/* Input Bar */}
        <form onSubmit={addTask} className="relative mb-10 group z-10">
          <input
            type="text"
            placeholder="Add a new task..."
            className="w-full pl-6 pr-16 py-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white placeholder-white/40 shadow-xl focus:bg-white/20 focus:scale-[1.01] outline-none transition-all duration-300 text-lg"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-3 top-3 bottom-3 bg-gradient-to-r from-pink-500 to-purple-500 w-12 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 active:scale-95"
          >
            <Plus size={24} className="text-white" />
          </button>
        </form>

        {/* --- PENDING TASKS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {pendingTasks.map((task, index) => (
            <div 
              key={task._id} 
              style={{ animationDelay: `${index * 0.5}s` }}
              className="animate-float aspect-square bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-5 flex flex-col justify-between shadow-2xl hover:shadow-pink-500/20 hover:border-pink-300/50 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start opacity-50 group-hover:opacity-100 transition">
                <button 
                  onClick={() => toggleComplete(task)}
                  className="w-8 h-8 rounded-full border-2 border-white/30 hover:border-green-400 hover:bg-green-400/20 transition flex items-center justify-center"
                  title="Mark as Complete"
                >
                  <Check size={14} className="text-transparent hover:text-green-400" />
                </button>
                <button 
                  onClick={() => promptDelete(task._id)}
                  className="text-white/30 hover:text-red-400 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center text-center overflow-hidden py-2">
                 {editingId === task._id ? (
                  <textarea 
                    autoFocus
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={() => saveEdit(task._id)}
                    className="w-full h-full bg-transparent text-white text-center resize-none outline-none border-b border-pink-500"
                  />
                ) : (
                  <h3 
                    onClick={() => { setEditingId(task._id); setEditTitle(task.title); }}
                    className="text-lg sm:text-xl font-bold text-white drop-shadow-md break-words cursor-pointer select-none"
                  >
                    {task.title}
                  </h3>
                )}
              </div>
              
              <div className="text-center">
                 <span className="text-xs text-white/40 font-semibold bg-black/20 px-3 py-1 rounded-full">
                    Pending
                 </span>
              </div>
            </div>
          ))}

          {pendingTasks.length === 0 && (
            <div className="aspect-square border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center text-white/20">
              <p>No tasks yet</p>
            </div>
          )}
        </div>

        {/* --- COMPLETED TASKS GRID --- */}
        {completedTasks.length > 0 && (
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-white/50 uppercase tracking-widest text-sm mb-6 font-bold">Completed Tasks</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {completedTasks.map((task) => (
                <div 
                  key={task._id} 
                  className="aspect-square bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 p-5 flex flex-col justify-between shadow-inner opacity-80 hover:opacity-100 transition duration-300"
                >
                  <div className="flex justify-between items-start">
                    <button 
                      onClick={() => toggleComplete(task)}
                      className="w-8 h-8 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/40 flex items-center justify-center transition hover:scale-110"
                      title="Mark as Incomplete"
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => promptDelete(task._id)}
                      className="text-white/20 hover:text-red-400 transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center overflow-hidden py-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white/50 line-through break-words select-none">
                      {task.title}
                    </h3>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-green-400/60 font-semibold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                      Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;