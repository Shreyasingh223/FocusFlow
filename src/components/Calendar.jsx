import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    CalendarDays,
} from 'lucide-react';

import "./Calendar.css";

function Calender() {
    const today = new Date();

    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );

    const [selectedDate, setSelectedDate] = useState(
        formatDate(today)
    );

    const [reminders, setReminders] = useState(() => {
        const savedReminders = localStorage.getItem("focusflow-reminders");
        return savedReminders ? JSON.parse(savedReminders) : [];
    });

    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");

    // Save reminders
    const saveReminders = (updatedReminders) => {
        setReminders(updatedReminders);
        localStorage.setItem("focusflow-reminders", JSON.stringify(updatedReminders));
    };

    // Previous month
    const prevMonth = () => {
        setCurrentDate(new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
        ));
    };

    // Next month
    const nextMonth = () => {
        setCurrentDate(new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
        ));
    };

    // go to today
    const goToToday = () => {
        const todayDate = new Date();

        setCurrentDate(
            new Date(
                todayDate.getFullYear(),
                todayDate.getMonth(),
                1
            )
        );
        setSelectedDate(formatDate(todayDate));
    };

    // Add reminder
    const addReminder = (e) => {
        e.preventDefault();

        if (!title.trim()) return;

        const newReminder = {
            id: Date.now(),
            title: title.trim(),
            time,
            description: description.trim(),
            date: selectedDate,
        };

        saveReminders([
            ...reminders,
            newReminder,
        ]);

        setTitle("");
        setTime("");
        setDescription("");
        setShowForm(false);
    };

    // Delete reminder
    const deleteReminder = (id) => {
        const updatedReminders = reminders.filter((reminder) => reminder.id !== id);
        saveReminders(updatedReminders);
    };

    // Calender information
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];

    // Empty space before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }

    //Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const selectedReminders = reminders.filter((reminder) => reminder.date === selectedDate);

    const monthName = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

    return (
        <div className="calendar-page">

            {/* Header */}

            <div className="calendar-header">

                <div>
                    <p className="eyebrow">
                        PLAN YOUR DAY
                    </p>

                    <h1>
                        Calendar 📅
                    </h1>

                    <p>
                        Organize your schedule and never miss
                        an important reminder.
                    </p>
                </div>

                <button
                    className="today-button"
                    onClick={goToToday}
                >
                    Today
                </button>

            </div>


            {/* Calendar */}

            <div className="calendar-layout">

                <div className="calendar-card">

                    {/* Month navigation */}

                    <div className="calendar-top">

                        <button
                            className="calendar-nav"
                            onClick={previousMonth}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <h2>
                            {monthName}
                        </h2>

                        <button
                            className="calendar-nav"
                            onClick={nextMonth}
                        >
                            <ChevronRight size={20} />
                        </button>

                    </div>


                    {/* Weekdays */}

                    <div className="calendar-weekdays">

                        {[
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                        ].map((day) => (
                            <span key={day}>
                                {day}
                            </span>
                        ))}

                    </div>


                    {/* Days */}

                    <div className="calendar-grid">

                        {calendarDays.map((day, index) => {

                            if (day === null) {
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className="calendar-day empty"
                                    />
                                );
                            }

                            const date = new Date(
                                year,
                                month,
                                day
                            );

                            const dateString =
                                formatDate(date);

                            const isToday =
                                dateString ===
                                formatDate(today);

                            const isSelected =
                                dateString === selectedDate;

                            const hasReminder =
                                reminders.some(
                                    (reminder) =>
                                        reminder.date ===
                                        dateString
                                );

                            return (
                                <button
                                    key={day}
                                    className={`calendar-day
                    ${isToday ? "today" : ""}
                    ${isSelected ? "selected" : ""}
                  `}
                                    onClick={() =>
                                        setSelectedDate(dateString)
                                    }
                                >
                                    <span>
                                        {day}
                                    </span>

                                    {hasReminder && (
                                        <i className="reminder-dot" />
                                    )}
                                </button>
                            );
                        })}

                    </div>

                </div>


                {/* Reminders */}

                <div className="reminder-card">

                    <div className="reminder-header">

                        <div>
                            <span className="reminder-date">
                                {formatDisplayDate(selectedDate)}
                            </span>

                            <h2>
                                Reminders
                            </h2>
                        </div>

                        <button
                            className="add-reminder-button"
                            onClick={() =>
                                setShowForm(!showForm)
                            }
                        >
                            <Plus size={18} />
                            Add
                        </button>

                    </div>


                    {/* Add form */}

                    {showForm && (
                        <form
                            className="reminder-form"
                            onSubmit={addReminder}
                        >

                            <input
                                type="text"
                                placeholder="Reminder title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                autoFocus
                            />

                            <input
                                type="time"
                                value={time}
                                onChange={(e) =>
                                    setTime(e.target.value)
                                }
                            />

                            <textarea
                                placeholder="Description (optional)"
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                rows="3"
                            />

                            <div className="form-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button type="submit">
                                    Save reminder
                                </button>

                            </div>

                        </form>
                    )}


                    {/* Reminder list */}

                    {selectedReminders.length === 0 ? (

                        <div className="no-reminders">

                            <CalendarDays size={38} />

                            <strong>
                                No reminders
                            </strong>

                            <p>
                                Nothing planned for this day.
                            </p>

                        </div>

                    ) : (

                        <div className="reminder-list">

                            {selectedReminders
                                .sort((a, b) =>
                                    (a.time || "").localeCompare(
                                        b.time || ""
                                    )
                                )
                                .map((reminder) => (

                                    <div
                                        className="reminder-item"
                                        key={reminder.id}
                                    >

                                        <div className="reminder-time">
                                            {reminder.time || "Anytime"}
                                        </div>

                                        <div className="reminder-content">

                                            <strong>
                                                {reminder.title}
                                            </strong>

                                            {reminder.description && (
                                                <p>
                                                    {reminder.description}
                                                </p>
                                            )}

                                        </div>

                                        <button
                                            className="delete-reminder"
                                            onClick={() =>
                                                deleteReminder(reminder.id)
                                            }
                                        >
                                            <Trash2 size={17} />
                                        </button>

                                    </div>

                                ))}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}


// Format date for storage
function formatDate(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Format selected date for display
function formatDisplayDate(dateString) {
    const date = new Date(
        `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
        }
    );
}

export default Calender;