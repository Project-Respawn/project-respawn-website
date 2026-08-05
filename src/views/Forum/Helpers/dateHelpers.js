// =============================================================================
// Relative Dates
// =============================================================================

export function formatRelativeTime(value) {

    if (!value) {
        return "No activity yet";
    }

    const date = new Date(value);

    const now = new Date();

    const difference =
        now.getTime() - date.getTime();

    if (Number.isNaN(difference)) {
        return "No activity yet";
    }

    const minute = 60 * 1000;

    const hour = 60 * minute;

    const day = 24 * hour;

    const week = 7 * day;

    const month = 30 * day;

    const year = 365 * day;

    if (difference < minute) {
        return "Just now";
    }

    if (difference < hour) {

        const minutes =
            Math.floor(difference / minute);

        return `${minutes}m ago`;

    }

    if (difference < day) {

        const hours =
            Math.floor(difference / hour);

        return `${hours}h ago`;

    }

    if (difference < week) {

        const days =
            Math.floor(difference / day);

        return `${days}d ago`;

    }

    if (difference < month) {

        const weeks =
            Math.floor(difference / week);

        return `${weeks}w ago`;

    }

    if (difference < year) {

        return date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
            }
        );

    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );

}

// =============================================================================
// Standard Date
// =============================================================================

export function formatDate(value) {

    if (!value) {
        return "";
    }

    return new Date(value).toLocaleDateString(
        undefined,
        {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );

}

// =============================================================================
// Standard Time
// =============================================================================

export function formatTime(value) {

    if (!value) {
        return "";
    }

    return new Date(value).toLocaleTimeString(
        undefined,
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );

}

// =============================================================================
// Date & Time
// =============================================================================

export function formatDateTime(value) {

    if (!value) {
        return "";
    }

    return new Date(value).toLocaleString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

}

// =============================================================================
// ISO Date
// =============================================================================

export function formatIsoDate(value) {

    if (!value) {
        return "";
    }

    return new Date(value)
        .toISOString()
        .split("T")[0];

}

// =============================================================================
// Activity
// =============================================================================

export function hasRecentActivity(value, hours = 24) {

    if (!value) {
        return false;
    }

    const difference =
        Date.now() -
        new Date(value).getTime();

    return difference < hours * 60 * 60 * 1000;

}

// =============================================================================
// Sorting
// =============================================================================

export function newestFirst(a, b) {

    return (
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
    );

}

export function oldestFirst(a, b) {

    return (
        new Date(a.updatedAt ?? a.createdAt).getTime() -
        new Date(b.updatedAt ?? b.createdAt).getTime()
    );

}