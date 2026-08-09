// =============================================================================
// Forum Permissions
// =============================================================================

/**
 * Determines whether the supplied user belongs to one of the allowed groups.
 *
 * @param {Object|null} user
 * @param {string[]} groups
 * @returns {boolean}
 */
function hasGroup(user, groups = []) {
    if (!user || !Array.isArray(user.groups)) {
        return false;
    }

    const userGroups = user.groups.map(
        group => String(group).trim().toLowerCase()
    );

    return groups.some(
        group => userGroups.includes(
            String(group).trim().toLowerCase()
        )
    );
}

// =============================================================================
// User Roles
// =============================================================================

export function isSignedIn(user) {
    return Boolean(user);
}

export function isSuperAdmin(user) {
    return hasGroup(user, ['SuperAdmin']);
}

export function isAdmin(user) {
    return hasGroup(user, ['SuperAdmin', 'Admin']);
}

export function isStaff(user) {
    return hasGroup(user, [
        'SuperAdmin',
        'Admin',
        'Staff',
    ]);
}

export function isModerator(user) {
    return hasGroup(user, [
        'SuperAdmin',
        'Admin',
        'Staff',
        'Moderator',
    ]);
}

export function hasModerationAccess(user) {
    return isModerator(user);
}

// =============================================================================
// Thread Permissions
// =============================================================================

export function canCreateThread(user, board) {
    if (!isSignedIn(user)) {
        return false;
    }

    return board?.slug !== 'announcements' || isSuperAdmin(user);
}

export function canReply(user, thread) {
    if (!isSignedIn(user)) {
        return false;
    }

    if (!thread) {
        return false;
    }

    return !thread.isLocked || isModerator(user);
}

export function canEditThread(user, thread) {
    if (!user || !thread) {
        return false;
    }

    return (
        thread.authorUserId === user.userId ||
        isModerator(user)
    );
}

export function canDeleteThread(user, thread) {
    return canEditThread(user, thread);
}

export function canLockThread(user) {
    return isModerator(user);
}

export function canPinThread(user) {
    return isModerator(user);
}

export function canFeatureThread(user) {
    return isModerator(user);
}

// =============================================================================
// Post Permissions
// =============================================================================

export function canCreatePost(user) {
    return isSignedIn(user);
}

export function canEditPost(user, post) {
    if (!user || !post) {
        return false;
    }

    return (
        post.authorUserId === user.userId ||
        isModerator(user)
    );
}

export function canDeletePost(user, post) {
    return canEditPost(user, post);
}

// =============================================================================
// Board Permissions
// =============================================================================

export function canCreateBoard(user) {
    return isAdmin(user);
}

export function canEditBoard(user) {
    return isAdmin(user);
}

export function canDeleteBoard(user) {
    return isSuperAdmin(user);
}

// =============================================================================
// Category Permissions
// =============================================================================

export function canCreateCategory(user) {
    return isAdmin(user);
}

export function canEditCategory(user) {
    return isAdmin(user);
}

export function canDeleteCategory(user) {
    return isSuperAdmin(user);
}

// =============================================================================
// Visibility
// =============================================================================

export function canViewForum() {
    return true;
}

export function canViewBoard() {
    return true;
}

export function canViewThread() {
    return true;
}

export function canManageForum(user) {
    return isModerator(user);
}
