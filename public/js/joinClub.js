/**
 * Join Club JavaScript
 * Handles the functionality for the Join Club page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initPage();

    // Set up event listeners
    setupEventListeners();
});

// Global variables
let currentClub = null;
let userClubMemberships = [];
let userClubInvitations = [];

/**
 * Initialize the page
 */
function initPage() {
    // Load invitations
    loadInvitations();
    
    // Load club memberships
    loadMemberships();
    
    // Load clubs
    loadClubs();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Club search button
    document.getElementById('club-search-btn').addEventListener('click', function() {
        searchClubs(document.getElementById('club-search').value);
    });
    
    // Club search input (search on Enter key)
    document.getElementById('club-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchClubs(this.value);
        }
    });
    
    // Send join request button in modal
    document.getElementById('send-join-request-btn').addEventListener('click', sendJoinRequest);
}

/**
 * Load club invitations
 */
function loadInvitations() {
    const container = document.getElementById('invitations-container');
    
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading invitations...</span>
            </div>
            <p>Loading your invitations...</p>
        </div>
    `;
    
    // Fetch invitations from server
    fetch('/user/invitations')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load invitations');
            }
            return response.json();
        })
        .then(data => {
            userClubInvitations = data;
            displayInvitations(data);
        })
        .catch(error => {
            console.error('Error loading invitations:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to load invitations. Please try again later.
                </div>
            `;
        });
}

/**
 * Display club invitations
 * @param {Array} invitations - The invitations data
 */
function displayInvitations(invitations) {
    const container = document.getElementById('invitations-container');
    const noInvitationsMessage = document.getElementById('no-invitations-message');
    
    if (!invitations || invitations.length === 0) {
        container.innerHTML = '';
        noInvitationsMessage.classList.remove('d-none');
        return;
    }
    
    noInvitationsMessage.classList.add('d-none');
    
    // Sort invitations: pending first, then by date (newest first)
    invitations.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.sent_date) - new Date(a.sent_date);
    });
    
    const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
    const otherInvitations = invitations.filter(inv => inv.status !== 'pending');
    
    let html = '';
    
    // Pending invitations section
    if (pendingInvitations.length > 0) {
        html += `
            <h5 class="mb-3">Pending Invitations</h5>
            <div class="list-group mb-4">
        `;
        
        html += pendingInvitations.map(invitation => {
            const sentDate = new Date(invitation.sent_date).toLocaleDateString();
            
            return `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between mb-2">
                        <h5 class="mb-1">${invitation.club_name}</h5>
                        <small class="text-muted">Sent: ${sentDate}</small>
                    </div>
                    <p class="mb-1">${invitation.message || 'You have been invited to join this club.'}</p>
                    <small class="d-block mb-3">From: ${invitation.coach_name}</small>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-sm btn-success me-2 accept-invitation-btn" data-invitation-id="${invitation.id}">
                            <i class="bi bi-check-circle"></i> Accept
                        </button>
                        <button class="btn btn-sm btn-danger decline-invitation-btn" data-invitation-id="${invitation.id}">
                            <i class="bi bi-x-circle"></i> Decline
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        html += `</div>`;
    }
    
    // Previous invitations section
    if (otherInvitations.length > 0) {
        html += `
            <h5 class="mb-3">Previous Invitations</h5>
            <div class="list-group">
        `;
        
        html += otherInvitations.map(invitation => {
            const sentDate = new Date(invitation.sent_date).toLocaleDateString();
            
            // Status badge
            let statusBadge = '';
            switch (invitation.status) {
                case 'accepted':
                    statusBadge = '<span class="badge bg-success">Accepted</span>';
                    break;
                case 'rejected':
                    statusBadge = '<span class="badge bg-danger">Declined</span>';
                    break;
                case 'expired':
                    statusBadge = '<span class="badge bg-secondary">Expired</span>';
                    break;
                default:
                    statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
            }
            
            return `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between mb-2">
                        <h5 class="mb-1">${invitation.club_name}</h5>
                        <small class="text-muted">Sent: ${sentDate}</small>
                    </div>
                    <p class="mb-1">${invitation.message || 'You were invited to join this club.'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small>From: ${invitation.coach_name}</small>
                        ${statusBadge}
                    </div>
                </div>
            `;
        }).join('');
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
    
    // Add event listeners to accept/decline buttons
    container.querySelectorAll('.accept-invitation-btn').forEach(button => {
        button.addEventListener('click', function() {
            const invitationId = this.getAttribute('data-invitation-id');
            acceptInvitation(invitationId);
        });
    });
    
    container.querySelectorAll('.decline-invitation-btn').forEach(button => {
        button.addEventListener('click', function() {
            const invitationId = this.getAttribute('data-invitation-id');
            declineInvitation(invitationId);
        });
    });
}

/**
 * Accept a club invitation
 * @param {string} invitationId - The invitation ID
 */
function acceptInvitation(invitationId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to accept this club invitation?')) {
        return;
    }
    
    fetch(`/user/invitations/${invitationId}/accept`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to accept invitation');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Club invitation accepted successfully! You are now a member of this club.');
        
        // Refresh invitations
        loadInvitations();
        
        // Refresh memberships
        loadMemberships();
    })
    .catch(error => {
        console.error('Error accepting invitation:', error);
        showErrorMessage('Failed to accept invitation. Please try again.');
    });
}

/**
 * Decline a club invitation
 * @param {string} invitationId - The invitation ID
 */
function declineInvitation(invitationId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to decline this club invitation?')) {
        return;
    }
    
    fetch(`/user/invitations/${invitationId}/decline`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to decline invitation');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Club invitation declined.');
        
        // Refresh invitations
        loadInvitations();
    })
    .catch(error => {
        console.error('Error declining invitation:', error);
        showErrorMessage('Failed to decline invitation. Please try again.');
    });
}

/**
 * Load club memberships
 */
function loadMemberships() {
    const container = document.getElementById('memberships-container');
    
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading memberships...</span>
            </div>
            <p>Loading your club memberships...</p>
        </div>
    `;
    
    // Fetch memberships from server
    fetch('/user/memberships')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load memberships');
            }
            return response.json();
        })
        .then(data => {
            userClubMemberships = data;
            displayMemberships(data);
        })
        .catch(error => {
            console.error('Error loading memberships:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to load club memberships. Please try again later.
                </div>
            `;
        });
}

/**
 * Display club memberships
 * @param {Array} memberships - The memberships data
 */
function displayMemberships(memberships) {
    const container = document.getElementById('memberships-container');
    const noMembershipsMessage = document.getElementById('no-memberships-message');
    
    if (!memberships || memberships.length === 0) {
        container.innerHTML = '';
        noMembershipsMessage.classList.remove('d-none');
        return;
    }
    
    noMembershipsMessage.classList.add('d-none');
    
    // Sort memberships: active first, then by join date (newest first)
    memberships.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return new Date(b.join_date) - new Date(a.join_date);
    });
    
    const activeMembers = memberships.filter(mem => mem.status === 'active');
    const pendingMembers = memberships.filter(mem => mem.status === 'pending');
    
    let html = '';
    
    // Active memberships section
    if (activeMembers.length > 0) {
        html += `
            <div class="row row-cols-1 row-cols-md-2 g-4 mb-4">
        `;
        
        html += activeMembers.map(membership => {
            const joinDate = new Date(membership.join_date).toLocaleDateString();
            
            return `
                <div class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${membership.club_name}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Member since: ${joinDate}</h6>
                            <p class="card-text small">${membership.club_description || 'No description available.'}</p>
                        </div>
                        <div class="card-footer bg-transparent">
                            <button class="btn btn-sm btn-outline-primary view-club-btn" data-club-id="${membership.club_id}">
                                <i class="bi bi-eye"></i> View Club
                            </button>
                            <button class="btn btn-sm btn-outline-danger leave-club-btn" data-membership-id="${membership.id}">
                                <i class="bi bi-box-arrow-right"></i> Leave Club
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        html += `</div>`;
    }
    
    // Pending memberships section
    if (pendingMembers.length > 0) {
        html += `
            <h5 class="mb-3">Pending Requests</h5>
            <div class="list-group">
        `;
        
        html += pendingMembers.map(membership => {
            const requestDate = new Date(membership.join_date).toLocaleDateString();
            
            return `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between mb-2">
                        <h5 class="mb-1">${membership.club_name}</h5>
                        <small class="text-muted">Requested: ${requestDate}</small>
                    </div>
                    <p class="mb-1">Your request to join this club is pending approval from the coach.</p>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-sm btn-outline-secondary view-club-btn" data-club-id="${membership.club_id}">
                            <i class="bi bi-eye"></i> View Club
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-2 cancel-request-btn" data-membership-id="${membership.id}">
                            <i class="bi bi-x-circle"></i> Cancel Request
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
    
    // Add event listeners to buttons
    container.querySelectorAll('.view-club-btn').forEach(button => {
        button.addEventListener('click', function() {
            const clubId = this.getAttribute('data-club-id');
            viewClubDetails(clubId);
        });
    });
    
    container.querySelectorAll('.leave-club-btn').forEach(button => {
        button.addEventListener('click', function() {
            const membershipId = this.getAttribute('data-membership-id');
            leaveClub(membershipId);
        });
    });
    
    container.querySelectorAll('.cancel-request-btn').forEach(button => {
        button.addEventListener('click', function() {
            const membershipId = this.getAttribute('data-membership-id');
            cancelJoinRequest(membershipId);
        });
    });
}

/**
 * Leave a club
 * @param {string} membershipId - The membership ID
 */
function leaveClub(membershipId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to leave this club? This action cannot be undone.')) {
        return;
    }
    
    fetch(`/user/memberships/${membershipId}/leave`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to leave club');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('You have left the club successfully.');
        
        // Refresh memberships
        loadMemberships();
    })
    .catch(error => {
        console.error('Error leaving club:', error);
        showErrorMessage('Failed to leave club. Please try again.');
    });
}

/**
 * Cancel a join request
 * @param {string} membershipId - The membership ID
 */
function cancelJoinRequest(membershipId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to cancel your request to join this club?')) {
        return;
    }
    
    fetch(`/user/memberships/${membershipId}/cancel`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to cancel join request');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Join request cancelled successfully.');
        
        // Refresh memberships
        loadMemberships();
    })
    .catch(error => {
        console.error('Error cancelling join request:', error);
        showErrorMessage('Failed to cancel join request. Please try again.');
    });
}

/**
 * Load clubs
 */
function loadClubs() {
    const container = document.getElementById('clubs-container');
    
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading clubs...</span>
            </div>
            <p>Loading clubs...</p>
        </div>
    `;
    
    // Fetch clubs from server
    fetch('/clubs')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load clubs');
            }
            return response.json();
        })
        .then(data => {
            displayClubs(data);
        })
        .catch(error => {
            console.error('Error loading clubs:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to load clubs. Please try again later.
                </div>
            `;
        });
}

/**
 * Display clubs
 * @param {Array} clubs - The clubs data
 * @param {string} searchTerm - Optional search term for filtering
 */
function displayClubs(clubs, searchTerm = '') {
    const container = document.getElementById('clubs-container');
    const noClubsMessage = document.getElementById('no-clubs-message');
    
    // Filter clubs if search term is provided
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        clubs = clubs.filter(club => 
            club.name.toLowerCase().includes(searchLower) || 
            (club.address && club.address.toLowerCase().includes(searchLower)) ||
            (club.description && club.description.toLowerCase().includes(searchLower))
        );
    }
    
    if (!clubs || clubs.length === 0) {
        container.innerHTML = '';
        noClubsMessage.classList.remove('d-none');
        return;
    }
    
    noClubsMessage.classList.add('d-none');
    
    // Sort clubs: verified first, then alphabetically
    clubs.sort((a, b) => {
        if (a.verification_status === 'verified' && b.verification_status !== 'verified') return -1;
        if (a.verification_status !== 'verified' && b.verification_status === 'verified') return 1;
        return a.name.localeCompare(b.name);
    });
    
    html = `
        <div class="row row-cols-1 row-cols-md-2 g-4">
    `;
    
    html += clubs.map(club => {
        // Verification badge
        let verificationBadge = '';
        if (club.verification_status === 'verified') {
            verificationBadge = '<span class="badge bg-success position-absolute top-0 end-0 m-2">Verified</span>';
        }
        
        // Default logo or club logo
        let logoHtml = '';
        if (club.logo) {
            logoHtml = `<img src="${club.logo}" class="card-img-top p-3" alt="${club.name} Logo" style="height: 150px; object-fit: contain;">`;
        } else {
            logoHtml = `
                <div class="bg-secondary text-white d-flex align-items-center justify-content-center mx-auto my-3" style="width: 100px; height: 100px; border-radius: 50%;">
                    <span class="display-5">${club.name.charAt(0).toUpperCase()}</span>
                </div>
            `;
        }
        
        return `
            <div class="col">
                <div class="card h-100 position-relative">
                    ${verificationBadge}
                    <div class="text-center">
                        ${logoHtml}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${club.name}</h5>
                        <p class="card-text small">${club.description || 'No description available.'}</p>
                        <p class="card-text"><small class="text-muted">${club.address || 'No address specified'}</small></p>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-primary view-club-details-btn" data-club-id="${club.id}">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Add event listeners to view details buttons
    container.querySelectorAll('.view-club-details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const clubId = this.getAttribute('data-club-id');
            viewClubDetails(clubId);
        });
    });
}

/**
 * Search clubs
 * @param {string} searchTerm - The search term
 */
function searchClubs(searchTerm) {
    const container = document.getElementById('clubs-container');
    
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading clubs...</span>
            </div>
            <p>Searching clubs...</p>
        </div>
    `;
    
    // If search term is empty, load all clubs
    if (!searchTerm) {
        loadClubs();
        return;
    }
    
    // Fetch clubs with search term
    fetch(`/clubs?search=${encodeURIComponent(searchTerm)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to search clubs');
            }
            return response.json();
        })
        .then(data => {
            displayClubs(data, searchTerm);
        })
        .catch(error => {
            console.error('Error searching clubs:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to search clubs. Please try again later.
                </div>
            `;
        });
}

/**
 * View club details
 * @param {string} clubId - The club ID
 */
function viewClubDetails(clubId) {
    // Fetch club details
    fetch(`/clubs/${clubId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load club details');
            }
            return response.json();
        })
        .then(club => {
            // Store the current club
            currentClub = club;
            
            // Set modal title
            document.getElementById('clubDetailsModalLabel').textContent = club.name;
            
            // Set club name
            document.getElementById('club-name').textContent = club.name;
            
            // Set verification badge
            const badgeContainer = document.getElementById('club-verification-badge');
            if (club.verification_status === 'verified') {
                badgeContainer.innerHTML = '<span class="badge bg-success">Verified</span>';
            } else {
                badgeContainer.innerHTML = '';
            }
            
            // Set logo
            const logoContainer = document.getElementById('club-logo-container');
            logoContainer.innerHTML = '';
            
            if (club.logo) {
                const logoImg = document.createElement('img');
                logoImg.src = club.logo;
                logoImg.alt = `${club.name} Logo`;
                logoImg.className = 'img-fluid';
                logoImg.style.maxHeight = '150px';
                logoContainer.appendChild(logoImg);
            } else {
                // Default logo placeholder
                const defaultLogo = document.createElement('div');
                defaultLogo.className = 'bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto';
                defaultLogo.style.width = '150px';
                defaultLogo.style.height = '150px';
                
                const logoText = document.createElement('span');
                logoText.className = 'text-white display-4';
                logoText.textContent = club.name.charAt(0).toUpperCase();
                
                defaultLogo.appendChild(logoText);
                logoContainer.appendChild(defaultLogo);
            }
            
            // Set description
            document.getElementById('club-description').textContent = club.description || 'No description available.';
            
            // Set contact information
            document.getElementById('club-address').textContent = club.address || 'Not specified';
            document.getElementById('club-phone').textContent = club.phone || 'Not specified';
            document.getElementById('club-email').textContent = club.email || 'Not specified';
            
            // Set website (if available)
            const websiteItem = document.getElementById('club-website-item');
            const websiteElement = document.getElementById('club-website');
            
            if (club.website) {
                websiteItem.classList.remove('d-none');
                websiteElement.innerHTML = `<a href="${club.website}" target="_blank">${club.website}</a>`;
            } else {
                websiteItem.classList.remove('d-none');
                websiteElement.textContent = 'Not specified';
            }
            
            // Check if user is already a member or has a pending request
            const joinRequestSection = document.getElementById('club-join-request-section');
            const alreadyMemberSection = document.getElementById('club-already-member-section');
            const requestPendingSection = document.getElementById('club-request-pending-section');
            
            const membership = userClubMemberships.find(m => m.club_id == clubId);
            
            if (membership) {
                // User is a member or has a pending request
                joinRequestSection.classList.add('d-none');
                
                if (membership.status === 'active') {
                    alreadyMemberSection.classList.remove('d-none');
                    requestPendingSection.classList.add('d-none');
                } else if (membership.status === 'pending') {
                    alreadyMemberSection.classList.add('d-none');
                    requestPendingSection.classList.remove('d-none');
                }
            } else {
                // User is not a member and has no pending request
                joinRequestSection.classList.remove('d-none');
                alreadyMemberSection.classList.add('d-none');
                requestPendingSection.classList.add('d-none');
            }
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('clubDetailsModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error loading club details:', error);
            showErrorMessage('Failed to load club details. Please try again.');
        });
}

/**
 * Send a join request
 */
function sendJoinRequest() {
    if (!currentClub) {
        showErrorMessage('No club selected');
        return;
    }
    
    const message = document.getElementById('join-request-message').value;
    
    // Show loading state
    const button = document.getElementById('send-join-request-btn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    
    fetch(`/clubs/${currentClub.id}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send join request');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('clubDetailsModal')).hide();
        
        // Show success message
        showSuccessMessage('Join request sent successfully! The club coach will review your request.');
        
        // Refresh memberships (to show the pending request)
        loadMemberships();
        
        // Reset form
        document.getElementById('join-request-message').value = '';
    })
    .catch(error => {
        console.error('Error sending join request:', error);
        showErrorMessage('Failed to send join request. Please try again.');
    })
    .finally(() => {
        // Restore button state
        button.disabled = false;
        button.innerHTML = originalText;
    });
}

/**
 * Show success message
 * @param {string} message - The success message
 */
function showSuccessMessage(message) {
    const alertContainer = document.getElementById('alert-container');
    
    alertContainer.className = 'alert alert-success alert-dismissible fade show';
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        bsAlert.close();
    }, 5000);
}

/**
 * Show error message
 * @param {string} message - The error message
 */
function showErrorMessage(message) {
    const alertContainer = document.getElementById('alert-container');
    
    alertContainer.className = 'alert alert-danger alert-dismissible fade show';
    alertContainer.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Auto hide after 7 seconds
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        bsAlert.close();
    }, 7000);
}
