// app/dashboard/calendar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Plus,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Users,
    Video,
    Briefcase,
    Trash2,
    Edit,
    X,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { CalendarSkeleton } from '../../components/ui/Skeleton';

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
    description?: string;
    location?: string;
    attendees?: string[];
    color?: string;
    type?: 'meeting' | 'task' | 'event' | 'holiday' | 'reminder';
}

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [view, setView] = useState('dayGridMonth');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: false,
        location: '',
        attendees: '',
        type: 'event',
        color: '#6366F1'
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const user = useSelector((state: any) => state.auth.user);
    const token = useSelector((state: any) => state.auth.token);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Use initial loading state for skeleton
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        // Show skeleton for at least 800ms for perceived performance
        const timer = setTimeout(() => setInitialLoading(false), 800);
        fetchEvents();
        return () => clearTimeout(timer);
    }, [currentDate]);

    if (initialLoading) {
        return (
            <div className="p-4 md:p-6">
                <CalendarSkeleton />
            </div>
        );
    }

    // app/dashboard/calendar/page.tsx - Update fetchEvents function
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/calendar/events`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear()
                }
            });

            // Handle the response structure from our new API
            if (res.data.success) {
                setEvents(res.data.events);
            } else {
                setEvents(res.data); // Fallback for old structure
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            // Don't show error to user, just set empty events
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Update saveEvent function
    const saveEvent = async () => {
        // ... validation code ...

        setSaving(true);
        try {
            const eventData = {
                ...formData,
                attendees: formData.attendees.split(',').map(s => s.trim()).filter(Boolean),
            };

            if (selectedEvent) {
                const res = await axios.put(
                    `${API_URL}/api/calendar/events/${selectedEvent.id}`,
                    eventData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.success) {
                    setEvents(events.map(e => e.id === selectedEvent.id ? res.data.event : e));
                }
            } else {
                const res = await axios.post(
                    `${API_URL}/api/calendar/events`,
                    eventData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.success) {
                    setEvents([...events, res.data.event]);
                }
            }
            setShowEventModal(false);
        } catch (error: any) {
            console.error('Error saving event:', error);
            setFormErrors({
                submit: error.response?.data?.message || 'Failed to save event'
            });
        } finally {
            setSaving(false);
        }
    };
    // Handle date click
    const handleDateClick = (arg: any) => {
        setSelectedDate(arg.date);
        setSelectedEvent(null);
        setFormData({
            title: '',
            description: '',
            start: format(arg.date, "yyyy-MM-dd'T'HH:mm"),
            end: format(arg.date, "yyyy-MM-dd'T'HH:mm"),
            allDay: false,
            location: '',
            attendees: '',
            type: 'event',
            color: '#6366F1'
        });
        setFormErrors({});
        setShowEventModal(true);
    };

    // Handle event click
    const handleEventClick = (arg: any) => {
        const event = events.find(e => e.id === arg.event.id);
        if (event) {
            setSelectedEvent(event);
            setFormData({
                title: event.title,
                description: event.description || '',
                start: event.start,
                end: event.end || event.start,
                allDay: event.allDay || false,
                location: event.location || '',
                attendees: event.attendees?.join(', ') || '',
                type: event.type || 'event',
                color: event.color || '#6366F1'
            });
            setFormErrors({});
            setShowEventModal(true);
        }
    };


    // Delete event
    const deleteEvent = async (eventId: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await axios.delete(`${API_URL}/api/calendar/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(events.filter(e => e.id !== eventId));
            setShowEventModal(false);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    // Event colors based on type
    const getEventColor = (type: string) => {
        switch (type) {
            case 'meeting': return '#8B5CF6'; // Purple
            case 'task': return '#10B981'; // Green
            case 'event': return '#6366F1'; // Indigo
            case 'holiday': return '#F59E0B'; // Amber
            case 'reminder': return '#EC4899'; // Pink
            default: return '#6366F1';
        }
    };

    // Get color classes for badges
    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'meeting': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            case 'task': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'event': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
            case 'holiday': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'reminder': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Calendar
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your schedule, meetings, and events
                    </p>
                </div>

                {/* Add Event Button */}
                <button
                    onClick={() => {
                        setSelectedEvent(null);
                        setFormData({
                            title: '',
                            description: '',
                            start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                            end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                            allDay: false,
                            location: '',
                            attendees: '',
                            type: 'event',
                            color: '#6366F1'
                        });
                        setShowEventModal(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Event</span>
                </button>
            </div>

            {/* Calendar Views Toggle */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit">
                {[
                    { value: 'dayGridMonth', label: 'Month' },
                    { value: 'timeGridWeek', label: 'Week' },
                    { value: 'timeGridDay', label: 'Day' }
                ].map((v) => (
                    <button
                        key={v.value}
                        onClick={() => setView(v.value)}
                        className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${view === v.value
                                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }
            `}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(currentDate.getMonth() - 1);
                            setCurrentDate(newDate);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(currentDate.getMonth() + 1);
                            setCurrentDate(newDate);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4">
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                            <p className="text-gray-500 mt-4">Loading calendar...</p>
                        </div>
                    </div>
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView={view}
                        headerToolbar={false}
                        events={events.map(event => ({
                            ...event,
                            backgroundColor: event.color || getEventColor(event.type || 'event'),
                            borderColor: 'transparent',
                            textColor: '#ffffff',
                            className: 'rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer'
                        }))}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="auto"
                        aspectRatio={1.8}
                        slotDuration="00:30:00"
                        slotLabelInterval="01:00"
                        allDaySlot={true}
                        nowIndicator={true}
                        navLinks={true}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={3}
                        weekends={true}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: 'short'
                        }}
                    />
                )}
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEventModal(false)} />

                    <div className="relative min-h-screen flex items-center justify-center p-4">
                        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">

                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-600/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {selectedEvent ? 'Edit Event' : 'Create New Event'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowEventModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                                <div className="space-y-4">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Event Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className={`
                        w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl
                        text-gray-900 dark:text-white placeholder-gray-400
                        focus:outline-none focus:ring-4 focus:ring-indigo-500/20
                        transition-all duration-200
                        ${formErrors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'}
                      `}
                                            placeholder="Team Meeting, Project Deadline, etc."
                                        />
                                        {formErrors.title && (
                                            <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
                                        )}
                                    </div>

                                    {/* Event Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Event Type
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                type: e.target.value as any,
                                                color: getEventColor(e.target.value)
                                            })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                                        >
                                            <option value="event">Event</option>
                                            <option value="meeting">Meeting</option>
                                            <option value="task">Task</option>
                                            <option value="reminder">Reminder</option>
                                            <option value="holiday">Holiday</option>
                                        </select>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Start Date & Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.start}
                                                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                End Date & Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.end}
                                                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    {/* All Day Toggle */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, allDay: !formData.allDay })}
                                            className={`
                        relative w-12 h-6 rounded-full transition-colors duration-300
                        ${formData.allDay ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}
                      `}
                                        >
                                            <span
                                                className={`
                          absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md
                          transition-transform duration-300
                          ${formData.allDay ? 'translate-x-6' : 'translate-x-0'}
                        `}
                                            />
                                        </button>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            All day event
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Location
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                                                placeholder="Conference Room, Google Meet, etc."
                                            />
                                        </div>
                                    </div>

                                    {/* Attendees */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Attendees
                                        </label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.attendees}
                                                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                                                placeholder="john@example.com, jane@example.com"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Separate email addresses with commas
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                                            placeholder="Add event details, agenda, notes..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                                {selectedEvent && (
                                    <button
                                        onClick={() => deleteEvent(selectedEvent.id)}
                                        className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Event
                                    </button>
                                )}
                                <div className="flex items-center gap-3 ml-auto">
                                    <button
                                        onClick={() => setShowEventModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveEvent}
                                        disabled={saving}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {selectedEvent ? 'Update Event' : 'Create Event'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS for FullCalendar */}
            <style jsx global>{`
        .fc {
          --fc-border-color: #e5e7eb;
          --fc-button-text-color: #4b5563;
          --fc-button-bg-color: transparent;
          --fc-button-border-color: transparent;
          --fc-button-hover-bg-color: #f3f4f6;
          --fc-button-hover-border-color: transparent;
          --fc-button-active-bg-color: #e5e7eb;
          --fc-today-bg-color: #f3f4f6;
          --fc-event-bg-color: #6366f1;
          --fc-event-border-color: transparent;
          --fc-event-text-color: #ffffff;
          --fc-event-selected-overlay-color: rgba(0,0,0,0.25);
        }
        
        .dark .fc {
          --fc-border-color: #374151;
          --fc-button-text-color: #d1d5db;
          --fc-button-hover-bg-color: #1f2937;
          --fc-button-active-bg-color: #111827;
          --fc-today-bg-color: #111827;
        }
        
        .fc .fc-toolbar {
          display: none;
        }
        
        .fc .fc-daygrid-day {
          transition: background-color 0.2s;
        }
        
        .fc .fc-daygrid-day:hover {
          background-color: rgba(99, 102, 241, 0.05);
          cursor: pointer;
        }
        
        .fc .fc-event {
          border-radius: 0.5rem;
          padding: 2px 4px;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .fc .fc-event:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 6px rgba(99,102,241,0.2);
        }
        
        .fc .fc-day-today .fc-daygrid-day-frame {
          background-color: rgba(99, 102, 241, 0.05);
        }
        
        .fc .fc-daygrid-day-number {
          padding: 8px;
          font-weight: 500;
          color: #1f2937;
        }
        
        .dark .fc .fc-daygrid-day-number {
          color: #e5e7eb;
        }
        
        .fc .fc-col-header-cell {
          padding: 12px 0;
          font-weight: 600;
          color: #4b5563;
        }
        
        .dark .fc .fc-col-header-cell {
          color: #9ca3af;
        }
        
        .fc .fc-more-popover {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        
        .dark .fc .fc-more-popover {
          background: #111827;
          border-color: #374151;
        }
        
        .fc .fc-popover-header {
          background: #f9fafb;
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 0.75rem 0.75rem 0 0;
        }
        
        .dark .fc .fc-popover-header {
          background: #1f2937;
          border-color: #374151;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}