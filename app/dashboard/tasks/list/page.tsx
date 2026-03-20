'use client';
import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreVertical,
    Clock,
    AlertCircle,
    CheckCircle2,
    Circle,
    Calendar as CalendarIcon,
    Tag,
    User as UserIcon,
    ArrowUpDown,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { getTasks, deleteTask, updateTask, Task } from '@/app/lib/api';
import TaskModal from '@/app/components/ui/TaskModal';

export default function TaskListPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required');
                    setLoading(false);
                    return;
                }
                const data = await getTasks(token);
                setTasks(data);
            } catch (err: any) {
                console.error('Failed to fetch tasks:', err);
                setError(err.message || 'Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleTaskDelete = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await deleteTask(token, taskId);
            setTasks(prev => prev.filter(t => t._id !== taskId));
        } catch (err) {
            console.error('Failed to delete task:', err);
            alert('Failed to delete task');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
            case 'Medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Low': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'Done':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'In Progress': return <Clock className="w-5 h-5 text-indigo-500 animate-pulse" />;
            case 'Pending':
            case 'Todo':
                return <Circle className="w-5 h-5 text-gray-400" />;
            case 'Canceled': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Loading your tasks...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Tasks</h3>
                <p className="text-gray-500 max-w-md mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Task Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Organize and track your team's workflow and tasks.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 hover:scale-105"
                >
                    <Plus size={20} />
                    Create New Task
                </button>
            </div>

            {/* Filters and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search tasks, descriptions, or assignees..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        <Filter size={18} />
                        Filters
                    </button>
                    <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        <ArrowUpDown size={18} />
                    </button>
                </div>
            </div>

            {/* Task List Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredTasks.map((task) => (
                                <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{task.title}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{task.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="relative group/status">
                                            <select
                                                value={task.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value as Task['status'];
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        if (!token) return;

                                                        // Optimistic update
                                                        setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
                                                        await updateTask(token, task._id, { status: newStatus });
                                                    } catch (err) {
                                                        console.error('Failed to update status:', err);
                                                        alert('Failed to update status');
                                                    }
                                                }}
                                                className={`
                          appearance-none pl-8 pr-8 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                          bg-gray-50 dark:bg-gray-800 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-900
                          focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500
                          ${task.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' :
                                                        task.status === 'Canceled' ? 'text-red-600 dark:text-red-400' :
                                                            task.status === 'In Progress' ? 'text-indigo-600 dark:text-indigo-400' :
                                                                'text-gray-600 dark:text-gray-400'}
                        `}
                                            >
                                                <option value="Todo">Todo</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Review">Review</option>
                                                <option value="Done">Done</option>
                                                <option value="Canceled">Canceled</option>
                                            </select>
                                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                {getStatusIcon(task.status)}
                                            </div>
                                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover/status:text-indigo-500 transition-colors" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                            <CalendarIcon className="w-4 h-4" />
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                {task.assignee?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{task.assignee?.name || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => handleTaskDelete(task._id)}
                                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                            title="Delete Task"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredTasks.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                            <Search className="w-8 h-8 opacity-20" />
                        </div>
                        <p>No tasks found. Create one to get started!</p>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTasks.length}</span> tasks
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">Next</button>
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTaskCreated={(newTask) => setTasks([newTask, ...tasks])}
            />
        </div>
    );
}
