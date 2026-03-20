'use client';
import React, { useState, useEffect } from 'react';
import {
    Plus,
    MoreHorizontal,
    Calendar as CalendarIcon,
    MessageSquare,
    Paperclip,
    GripHorizontal,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { getTasks, updateTask, Task } from '@/app/lib/api';
import TaskModal from '@/app/components/ui/TaskModal';

const columns: { title: string; status: Task['status']; color: string }[] = [
    { title: 'To Do', status: 'Todo', color: 'bg-gray-100 dark:bg-gray-800' },
    { title: 'In Progress', status: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Under Review', status: 'Review', color: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Done', status: 'Done', color: 'bg-emerald-50 dark:bg-emerald-900/20' }
];

export default function KanbanPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState('Todo');


    useEffect(() => {
        fetchTasks();
    }, []);

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

    const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Optimistic update
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

            await updateTask(token, taskId, { status: newStatus });
        } catch (err) {
            console.error('Failed to update task status:', err);
            // Revert on error
            fetchTasks();
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300';
            case 'Medium': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300';
            case 'Low': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'Todo': return 'bg-gray-400';
            case 'In Progress': return 'bg-blue-500';
            case 'Review': return 'bg-amber-500';
            case 'Done': return 'bg-emerald-500';
            default: return 'bg-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Loading your board...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] text-center p-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Board</h3>
                <p className="text-gray-500 max-w-md mb-6">{error}</p>
                <button
                    onClick={fetchTasks}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 h-full flex flex-col space-y-6 overflow-hidden">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Project Kanban
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Visualize your workflow and manage tasks across different stages.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setModalStatus('Todo'); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200"
                    >
                        <Plus size={18} />
                        Add Task
                    </button>
                </div>
            </div>

            {/* Board Content */}
            <div className="flex-1 flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                {columns.map((column) => (
                    <div
                        key={column.status}
                        className={`flex-shrink-0 w-80 flex flex-col rounded-2xl ${column.color} border border-gray-200/50 dark:border-gray-700/30 backdrop-blur-sm shadow-sm`}
                    >
                        {/* Column Header */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(column.status)}`} />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{column.title}</h3>
                                <span className="text-xs px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-full text-gray-500 font-medium">
                                    {tasks.filter(t => t.status === column.status).length}
                                </span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        {/* Column Tasks */}
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide">
                            {tasks.filter(t => t.status === column.status).map((task) => (
                                <div
                                    key={task._id}
                                    className="group bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-900/50 transition-all duration-200 cursor-grab active:cursor-grabbing"
                                >
                                    <div className="flex justify-between items-start mb-2 text-gray-400 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <GripHorizontal size={14} />
                                        <div className="flex gap-1 group/move relative">
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task._id, e.target.value as Task['status'])}
                                                className="appearance-none bg-indigo-50/50 dark:bg-indigo-900/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-transparent hover:border-indigo-300 transition-all cursor-pointer outline-none"
                                            >
                                                <option disabled value="">Move to...</option>
                                                {columns.map(col => (
                                                    <option key={col.status} value={col.status}>{col.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${getPriorityColor(task.priority)}`}>
                                        {task.priority || 'Medium'}
                                    </span>

                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {task.title}
                                    </h4>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                                        {task.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                <MessageSquare size={12} />
                                                {task.commentsCount || 0}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                <Paperclip size={12} />
                                                {task.attachmentsCount || 0}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                                                <CalendarIcon size={10} />
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                                            </span>
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-white dark:border-gray-800">
                                                {task.assignee?.name?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => { setModalStatus(column.status); setIsModalOpen(true); }}
                                className="w-full py-2.5 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-all duration-200 group"
                            >
                                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                <span>Add Task</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
                initialStatus={modalStatus}
            />
        </div>
    );
}
